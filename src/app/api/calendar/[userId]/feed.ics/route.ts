import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateICSFeed } from "@/lib/calendar/ics-generator";
import { ROLE_LABELS } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: token } = await params;

  // Look up user by calendar token for security
  const user = await prisma.user.findUnique({
    where: { calendarToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid calendar token" }, { status: 404 });
  }

  // Get all confirmed/locked assignments for this user
  const assignments = await prisma.assignment.findMany({
    where: {
      userId: user.id,
      status: { in: ["CONFIRMED", "LOCKED"] },
    },
    include: {
      week: {
        include: { quarter: true },
      },
    },
    orderBy: { week: { startDate: "asc" } },
  });

  const events = assignments.map((a) => ({
    weekNumber: a.week.weekNumber,
    role: ROLE_LABELS[a.role] || a.role,
    quarterName: a.week.quarter.name,
    startDate: a.week.startDate,
    endDate: a.week.endDate,
  }));

  const ics = generateICSFeed(user.name, events);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="oncall-${user.name.toLowerCase().replace(/\s/g, "-")}.ics"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
