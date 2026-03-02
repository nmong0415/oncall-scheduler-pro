"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function getAppSettings() {
  let settings = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings) {
    settings = await prisma.appSettings.create({
      data: { id: "singleton" },
    });
  }

  return settings;
}

export async function updateAppSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  const preferenceDeadlineDays = parseInt(
    formData.get("preferenceDeadlineDays") as string
  );
  const maxConsecutiveWeeks = parseInt(
    formData.get("maxConsecutiveWeeks") as string
  );
  const notificationsEnabled = formData.get("notificationsEnabled") === "true";

  await prisma.appSettings.update({
    where: { id: "singleton" },
    data: {
      preferenceDeadlineDays,
      maxConsecutiveWeeks,
      notificationsEnabled,
    },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
