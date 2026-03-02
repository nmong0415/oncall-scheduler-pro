import { ScoringContext, ScoringWeights, DEFAULT_WEIGHTS } from "./types";

export function scoreUserForSlot(
  userId: string,
  weekId: string,
  isHoliday: boolean,
  context: ScoringContext,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  let score = 0;

  // 1. Preference matching
  const prefKey = `${weekId}:${userId}`;
  const preference = context.preferences.get(prefKey);

  if (preference === "UNAVAILABLE") {
    return -Infinity; // Cannot assign
  } else if (preference === "PREFERRED") {
    score += weights.preferredBonus;
  } else if (preference === "AVAILABLE") {
    score += weights.availableBonus;
  } else {
    // No preference submitted - treat as neutral (slightly lower than AVAILABLE)
    score += weights.availableBonus / 2;
  }

  // 2. Recency penalty (back-to-back prevention)
  const weekIndex = context.weekOrder.indexOf(weekId);
  const recentWeeks = context.recentAssignments.get(userId) || [];

  if (weekIndex > 0) {
    const prevWeekId = context.weekOrder[weekIndex - 1];
    if (recentWeeks.includes(prevWeekId)) {
      score += weights.backToBackPenalty;
    }
  }
  if (weekIndex < context.weekOrder.length - 1) {
    const nextWeekId = context.weekOrder[weekIndex + 1];
    if (recentWeeks.includes(nextWeekId)) {
      score += weights.backToBackPenalty;
    }
  }

  // 3. Fairness: penalize users who already have more assignments this quarter
  const assignmentCount = context.assignmentCounts.get(userId) || 0;
  score += assignmentCount * weights.fairnessPenalty;

  // 4. Holiday equity: bonus if user has fewer holiday assignments historically
  if (isHoliday) {
    const holidayCount = context.holidayHistory.get(userId) || 0;
    // Calculate average holiday count
    const allHolidayCounts = Array.from(context.holidayHistory.values());
    const avgHoliday =
      allHolidayCounts.length > 0
        ? allHolidayCounts.reduce((a, b) => a + b, 0) / allHolidayCounts.length
        : 0;

    if (holidayCount <= avgHoliday) {
      score += weights.holidayBonus;
    }
  }

  return score;
}
