import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendDeadlineReminder } from "@/lib/email/send";
import { addDays, format, isBefore } from "date-fns";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find draft quarters with upcoming deadlines
  const now = new Date();
  const threeDaysFromNow = addDays(now, 3);

  const quarters = await prisma.quarter.findMany({
    where: {
      status: "DRAFT",
      preferenceDeadline: {
        gte: now,
        lte: threeDaysFromNow,
      },
    },
  });

  if (quarters.length === 0) {
    return NextResponse.json({ success: true, remindersSent: 0 });
  }

  // Get all active users
  const users = await prisma.user.findMany({
    where: { isActive: true },
  });

  let sent = 0;
  for (const quarter of quarters) {
    // Find users who haven't submitted preferences
    const existingPrefs = await prisma.preference.findMany({
      where: {
        week: { quarterId: quarter.id },
      },
      select: { userId: true },
      distinct: ["userId"],
    });

    const submittedUserIds = new Set(existingPrefs.map((p) => p.userId));
    const missingUsers = users.filter((u) => !submittedUserIds.has(u.id));

    for (const user of missingUsers) {
      await sendDeadlineReminder(
        user.email,
        user.name,
        quarter.name,
        format(quarter.preferenceDeadline!, "MMM d, yyyy")
      );
      sent++;
    }
  }

  return NextResponse.json({ success: true, remindersSent: sent });
}
