"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function createSwapRequest(
  assignmentId: string,
  toUserId: string,
  reason?: string
) {
  const session = await auth();
  if (!session?.user?.dbId) throw new Error("Unauthorized");

  // Verify the assignment belongs to the current user
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) throw new Error("Assignment not found");
  if (assignment.userId !== session.user.dbId) {
    throw new Error("You can only swap your own assignments");
  }
  if (assignment.status === "LOCKED") {
    throw new Error("Cannot swap a locked assignment");
  }

  // Verify target user is active and has the same role
  const toUser = await prisma.user.findUnique({
    where: { id: toUserId },
  });

  if (!toUser || !toUser.isActive) {
    throw new Error("Target user not found or inactive");
  }
  if (toUser.role !== assignment.role) {
    throw new Error("Can only swap with someone of the same role");
  }

  const swap = await prisma.swapRequest.create({
    data: {
      assignmentId,
      fromUserId: session.user.dbId,
      toUserId,
      reason,
    },
  });

  revalidatePath("/swaps");
  return { success: true, swapId: swap.id };
}

export async function respondToSwap(
  swapId: string,
  response: "APPROVED" | "REJECTED"
) {
  const session = await auth();
  if (!session?.user?.dbId) throw new Error("Unauthorized");

  const swap = await prisma.swapRequest.findUnique({
    where: { id: swapId },
    include: { assignment: true },
  });

  if (!swap) throw new Error("Swap request not found");
  if (swap.status !== "PENDING") throw new Error("Swap already resolved");

  // Either the target user or an admin can respond
  const isTarget = swap.toUserId === session.user.dbId;
  const isAdmin = session.user.isAdmin;
  if (!isTarget && !isAdmin) throw new Error("Unauthorized");

  if (response === "APPROVED") {
    // Perform the swap in a transaction
    await prisma.$transaction([
      prisma.assignment.update({
        where: { id: swap.assignmentId },
        data: { userId: swap.toUserId },
      }),
      prisma.swapRequest.update({
        where: { id: swapId },
        data: { status: "APPROVED", respondedAt: new Date() },
      }),
    ]);
  } else {
    await prisma.swapRequest.update({
      where: { id: swapId },
      data: { status: "REJECTED", respondedAt: new Date() },
    });
  }

  revalidatePath("/swaps");
  revalidatePath("/my-shifts");
  revalidatePath("/schedule");
  return { success: true };
}

export async function cancelSwapRequest(swapId: string) {
  const session = await auth();
  if (!session?.user?.dbId) throw new Error("Unauthorized");

  const swap = await prisma.swapRequest.findUnique({
    where: { id: swapId },
  });

  if (!swap) throw new Error("Swap request not found");
  if (swap.fromUserId !== session.user.dbId && !session.user.isAdmin) {
    throw new Error("Unauthorized");
  }
  if (swap.status !== "PENDING") throw new Error("Swap already resolved");

  await prisma.swapRequest.update({
    where: { id: swapId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/swaps");
  return { success: true };
}

export async function getSwapRequests() {
  const session = await auth();
  if (!session?.user?.dbId) throw new Error("Unauthorized");

  const where = session.user.isAdmin
    ? {}
    : {
        OR: [
          { fromUserId: session.user.dbId },
          { toUserId: session.user.dbId },
        ],
      };

  return prisma.swapRequest.findMany({
    where,
    include: {
      assignment: {
        include: {
          week: { include: { quarter: true } },
        },
      },
      fromUser: true,
      toUser: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
