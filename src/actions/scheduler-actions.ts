"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { generateSchedule, detectGaps } from "@/lib/scheduling/scheduler";

export async function runAutoScheduler(quarterId: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  // Clear existing non-locked assignments
  await prisma.assignment.deleteMany({
    where: {
      week: { quarterId },
      status: { not: "LOCKED" },
    },
  });

  const { newAssignments, gaps } = await generateSchedule(quarterId);

  // Bulk create new assignments
  if (newAssignments.length > 0) {
    await prisma.assignment.createMany({
      data: newAssignments,
    });
  }

  revalidatePath("/schedule");
  revalidatePath("/admin/quarters");

  return {
    success: true,
    assignmentsCreated: newAssignments.length,
    gaps,
  };
}

export async function acceptAllSuggestions(quarterId: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  const result = await prisma.assignment.updateMany({
    where: {
      week: { quarterId },
      status: "SUGGESTED",
    },
    data: { status: "CONFIRMED" },
  });

  revalidatePath("/schedule");
  revalidatePath("/admin/quarters");

  return { success: true, confirmed: result.count };
}

export async function getGaps(quarterId: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  return detectGaps(quarterId);
}
