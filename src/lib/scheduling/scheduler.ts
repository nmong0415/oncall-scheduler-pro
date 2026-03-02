import { prisma } from "@/lib/db";
import { scoreUserForSlot } from "./scorer";
import { ScoringContext, GapInfo } from "./types";

const ROLES = ["TECH", "SE", "UL", "ESCALATION"] as const;

export async function generateSchedule(quarterId: string) {
  // Load all data
  const quarter = await prisma.quarter.findUnique({
    where: { id: quarterId },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          assignments: true,
          preferences: true,
        },
      },
    },
  });

  if (!quarter) throw new Error("Quarter not found");

  const users = await prisma.user.findMany({
    where: { isActive: true },
  });

  const rotationHistory = await prisma.rotationHistory.findMany();

  // Build scoring context
  const preferences = new Map<string, string>();
  for (const week of quarter.weeks) {
    for (const pref of week.preferences) {
      preferences.set(`${week.id}:${pref.userId}`, pref.preference);
    }
  }

  const holidayHistory = new Map<string, number>();
  for (const rh of rotationHistory) {
    if (rh.isHoliday) {
      holidayHistory.set(rh.userId, (holidayHistory.get(rh.userId) || 0) + 1);
    }
  }

  const weekOrder = quarter.weeks.map((w) => w.id);
  const assignmentCounts = new Map<string, number>();
  const recentAssignments = new Map<string, string[]>();
  const currentAssignments = new Map<string, string>();

  // Pre-populate locked assignments
  for (const week of quarter.weeks) {
    for (const assignment of week.assignments) {
      if (assignment.status === "LOCKED") {
        currentAssignments.set(`${week.id}:${assignment.role}`, assignment.userId);
        assignmentCounts.set(
          assignment.userId,
          (assignmentCounts.get(assignment.userId) || 0) + 1
        );
        const recent = recentAssignments.get(assignment.userId) || [];
        recent.push(week.id);
        recentAssignments.set(assignment.userId, recent);
      }
    }
  }

  const context: ScoringContext = {
    preferences,
    assignmentCounts,
    recentAssignments,
    holidayHistory,
    weekOrder,
    currentAssignments,
  };

  // Group users by role
  const usersByRole = new Map<string, typeof users>();
  for (const role of ROLES) {
    usersByRole.set(
      role,
      users.filter((u) => u.role === role)
    );
  }

  // Generate assignments
  const newAssignments: {
    weekId: string;
    userId: string;
    role: (typeof ROLES)[number];
    status: "SUGGESTED";
  }[] = [];
  const gaps: GapInfo[] = [];

  for (const week of quarter.weeks) {
    for (const role of ROLES) {
      const existingKey = `${week.id}:${role}`;
      if (currentAssignments.has(existingKey)) continue; // Already locked

      const candidates = usersByRole.get(role) || [];
      if (candidates.length === 0) {
        gaps.push({
          weekId: week.id,
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          role,
        });
        continue;
      }

      // Score all candidates
      const scored = candidates.map((user) => ({
        user,
        score: scoreUserForSlot(user.id, week.id, week.isHoliday, context),
      }));

      // Sort descending by score
      scored.sort((a, b) => b.score - a.score);

      // Pick best candidate that isn't -Infinity
      const best = scored.find((s) => s.score > -Infinity);

      if (best) {
        newAssignments.push({
          weekId: week.id,
          userId: best.user.id,
          role,
          status: "SUGGESTED",
        });

        // Update running context
        assignmentCounts.set(
          best.user.id,
          (assignmentCounts.get(best.user.id) || 0) + 1
        );
        const recent = recentAssignments.get(best.user.id) || [];
        recent.push(week.id);
        recentAssignments.set(best.user.id, recent);
        currentAssignments.set(existingKey, best.user.id);
      } else {
        gaps.push({
          weekId: week.id,
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          role,
        });
      }
    }
  }

  return { newAssignments, gaps };
}

export async function detectGaps(quarterId: string): Promise<GapInfo[]> {
  const quarter = await prisma.quarter.findUnique({
    where: { id: quarterId },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: { assignments: true },
      },
    },
  });

  if (!quarter) return [];

  const gaps: GapInfo[] = [];

  for (const week of quarter.weeks) {
    for (const role of ROLES) {
      const hasAssignment = week.assignments.some((a) => a.role === role);
      if (!hasAssignment) {
        gaps.push({
          weekId: week.id,
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          role,
        });
      }
    }
  }

  return gaps;
}
