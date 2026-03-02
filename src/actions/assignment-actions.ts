"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function createAssignment(
  weekId: string,
  userId: string,
  role: string,
  status: "SUGGESTED" | "CONFIRMED" | "LOCKED" = "CONFIRMED"
) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  // Delete any existing assignment for this week+role first
  await prisma.assignment.deleteMany({
    where: { weekId, role: role as "TECH" | "SE" | "UL" | "ESCALATION" },
  });

  const assignment = await prisma.assignment.create({
    data: {
      weekId,
      userId,
      role: role as "TECH" | "SE" | "UL" | "ESCALATION",
      status,
    },
  });

  revalidatePath("/schedule");
  revalidatePath("/admin/quarters");
  return { success: true, assignment };
}

export async function updateAssignmentStatus(
  assignmentId: string,
  status: "SUGGESTED" | "CONFIRMED" | "LOCKED"
) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { status },
  });

  revalidatePath("/schedule");
  return { success: true };
}

export async function removeAssignment(assignmentId: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  await prisma.assignment.delete({ where: { id: assignmentId } });

  revalidatePath("/schedule");
  revalidatePath("/admin/quarters");
  return { success: true };
}

export async function confirmAllSuggested(quarterId: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  await prisma.assignment.updateMany({
    where: {
      week: { quarterId },
      status: "SUGGESTED",
    },
    data: { status: "CONFIRMED" },
  });

  revalidatePath("/schedule");
  revalidatePath("/admin/quarters");
  return { success: true };
}

export async function getMyAssignments() {
  const session = await auth();
  if (!session?.user?.dbId) throw new Error("Unauthorized");

  return prisma.assignment.findMany({
    where: { userId: session.user.dbId },
    include: {
      week: {
        include: { quarter: true },
      },
      user: true,
    },
    orderBy: { week: { startDate: "asc" } },
  });
}
