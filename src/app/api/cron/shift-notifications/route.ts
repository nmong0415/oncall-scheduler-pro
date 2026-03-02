import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendShiftReminder } from "@/lib/email/send";
import { ROLE_LABELS } from "@/lib/constants";
import { addDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find assignments for next week
  const nextMonday = addDays(new Date(), 7 - new Date().getDay() + 1);
  const nextSunday = addDays(nextMonday, 6);

  const upcomingAssignments = await prisma.assignment.findMany({
    where: {
      week: {
        startDate: { gte: nextMonday, lte: nextSunday },
        quarter: { status: "PUBLISHED" },
      },
      status: { in: ["CONFIRMED", "LOCKED"] },
    },
    include: {
      user: true,
      week: true,
    },
  });

  let sent = 0;
  for (const assignment of upcomingAssignments) {
    const weekDates = `${format(assignment.week.startDate, "MMM d")} - ${format(assignment.week.endDate, "MMM d, yyyy")}`;
    await sendShiftReminder(
      assignment.user.email,
      assignment.user.name,
      weekDates,
      ROLE_LABELS[assignment.role] || assignment.role
    );
    sent++;
  }

  return NextResponse.json({ success: true, notificationsSent: sent });
}
