import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

console.log("Connecting to:", process.env.DATABASE_URL?.replace(/\/\/.*@/, "//***@"));

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create demo users sequentially (local Prisma dev has connection_limit=1)
  const usersData = [
    { email: "admin@example.com", name: "Admin User", role: "TECH" as const, isAdmin: true, password: "admin" },
    { email: "tech1@example.com", name: "Alice Johnson", role: "TECH" as const, password: "password" },
    { email: "tech2@example.com", name: "Bob Smith", role: "TECH" as const, password: "password" },
    { email: "tech3@example.com", name: "Charlie Brown", role: "TECH" as const, password: "password" },
    { email: "se1@example.com", name: "Diana Prince", role: "SE" as const, password: "password" },
    { email: "se2@example.com", name: "Edward Norton", role: "SE" as const, password: "password" },
    { email: "se3@example.com", name: "Fiona Apple", role: "SE" as const, password: "password" },
    { email: "ul1@example.com", name: "George Miller", role: "UL" as const, password: "password" },
    { email: "ul2@example.com", name: "Helen Troy", role: "UL" as const, password: "password" },
    { email: "esc1@example.com", name: "Ivan Petrov", role: "ESCALATION" as const, password: "password" },
    { email: "esc2@example.com", name: "Julia Roberts", role: "ESCALATION" as const, password: "password" },
  ];

  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`  Created user: ${userData.name} (${userData.role})`);
  }

  console.log(`Created ${usersData.length} users`);

  // Create app settings singleton
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      preferenceDeadlineDays: 14,
      maxConsecutiveWeeks: 1,
      notificationsEnabled: true,
    },
  });

  console.log("Created app settings");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
