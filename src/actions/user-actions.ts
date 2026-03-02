"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["TECH", "SE", "UL", "ESCALATION"]),
  isAdmin: z.boolean().default(false),
});

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  const parsed = createUserSchema.parse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
    isAdmin: formData.get("isAdmin") === "true",
  });

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (existing) throw new Error("A user with this email already exists");

  await prisma.user.create({
    data: {
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
      isAdmin: parsed.isAdmin,
      password: "default",
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUser(
  userId: string,
  data: { name?: string; role?: string; isAdmin?: boolean }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.role && { role: data.role as "TECH" | "SE" | "UL" | "ESCALATION" }),
      ...(data.isAdmin !== undefined && { isAdmin: data.isAdmin }),
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserActive(userId: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}

export async function getUsersByRole(role: string) {
  return prisma.user.findMany({
    where: { role: role as "TECH" | "SE" | "UL" | "ESCALATION", isActive: true },
    orderBy: { name: "asc" },
  });
}
