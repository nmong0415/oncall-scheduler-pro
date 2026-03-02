"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

const preferenceSchema = z.object({
  weekId: z.string(),
  preference: z.enum(["PREFERRED", "AVAILABLE", "UNAVAILABLE"]),
  notes: z.string().optional(),
});

export async function submitPreferences(
  preferences: { weekId: string; preference: string; notes?: string }[]
) {
  const session = await auth();
  if (!session?.user?.dbId) throw new Error("Unauthorized");

  const userId = session.user.dbId;

  // Validate all preferences
  const parsed = preferences.map((p) => preferenceSchema.parse(p));

  // Upsert each preference
  await prisma.$transaction(
    parsed.map((p) =>
      prisma.preference.upsert({
        where: {
          weekId_userId: { weekId: p.weekId, userId },
        },
        update: {
          preference: p.preference,
          notes: p.notes,
        },
        create: {
          weekId: p.weekId,
          userId,
          preference: p.preference,
          notes: p.notes,
        },
      })
    )
  );

  revalidatePath("/preferences");
  return { success: true };
}

export async function getUserPreferences(quarterId: string) {
  const session = await auth();
  if (!session?.user?.dbId) throw new Error("Unauthorized");

  return prisma.preference.findMany({
    where: {
      userId: session.user.dbId,
      week: { quarterId },
    },
    include: { week: true },
    orderBy: { week: { weekNumber: "asc" } },
  });
}
