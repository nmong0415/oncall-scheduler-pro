"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";
import { addWeeks, startOfWeek, endOfWeek, addDays } from "date-fns";

const createQuarterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  preferenceDeadline: z.string().optional(),
});

export async function createQuarter(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  const parsed = createQuarterSchema.parse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    preferenceDeadline: formData.get("preferenceDeadline"),
  });

  const startDate = new Date(parsed.startDate);
  // Ensure we start on a Monday
  const firstMonday = startOfWeek(startDate, { weekStartsOn: 1 });
  const endDate = addDays(addWeeks(firstMonday, 13), -1); // 13 weeks later, Sunday

  const quarter = await prisma.quarter.create({
    data: {
      name: parsed.name,
      startDate: firstMonday,
      endDate,
      preferenceDeadline: parsed.preferenceDeadline
        ? new Date(parsed.preferenceDeadline)
        : null,
      weeks: {
        create: Array.from({ length: 13 }, (_, i) => {
          const weekStart = addWeeks(firstMonday, i);
          const weekEnd = addDays(weekStart, 6); // Sunday
          return {
            weekNumber: i + 1,
            startDate: weekStart,
            endDate: weekEnd,
          };
        }),
      },
    },
  });

  revalidatePath("/admin/quarters");
  return { success: true, quarterId: quarter.id };
}

export async function updateQuarterStatus(
  quarterId: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  await prisma.quarter.update({
    where: { id: quarterId },
    data: { status },
  });

  revalidatePath("/admin/quarters");
  revalidatePath("/schedule");
  return { success: true };
}

export async function deleteQuarter(quarterId: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  // Only allow deleting draft quarters
  const quarter = await prisma.quarter.findUnique({
    where: { id: quarterId },
  });

  if (!quarter) throw new Error("Quarter not found");
  if (quarter.status !== "DRAFT") {
    throw new Error("Can only delete draft quarters");
  }

  await prisma.quarter.delete({ where: { id: quarterId } });

  revalidatePath("/admin/quarters");
  return { success: true };
}

export async function toggleWeekHoliday(
  weekId: string,
  isHoliday: boolean,
  holidayName?: string
) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  await prisma.week.update({
    where: { id: weekId },
    data: { isHoliday, holidayName: isHoliday ? holidayName : null },
  });

  revalidatePath("/admin/quarters");
  return { success: true };
}

export async function getQuarters() {
  return prisma.quarter.findMany({
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          assignments: { include: { user: true } },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getQuarterById(quarterId: string) {
  return prisma.quarter.findUnique({
    where: { id: quarterId },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          assignments: { include: { user: true } },
          preferences: { include: { user: true } },
        },
      },
    },
  });
}

export async function getPublishedQuarter() {
  return prisma.quarter.findFirst({
    where: { status: "PUBLISHED" },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          assignments: { include: { user: true } },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getDraftQuarter() {
  return prisma.quarter.findFirst({
    where: { status: "DRAFT" },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          preferences: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });
}
