export interface ScoringContext {
  preferences: Map<string, string>; // key: `${weekId}:${userId}`, value: PreferenceType
  assignmentCounts: Map<string, number>; // userId -> count this quarter
  recentAssignments: Map<string, string[]>; // userId -> weekIds assigned (ordered)
  holidayHistory: Map<string, number>; // userId -> total holiday week count
  weekOrder: string[]; // ordered weekIds for adjacency checks
  currentAssignments: Map<string, string>; // key: `${weekId}:${role}`, value: userId
}

export interface ScoringWeights {
  preferredBonus: number;
  availableBonus: number;
  recencyPenalty: number;
  fairnessPenalty: number;
  holidayBonus: number;
  backToBackPenalty: number;
}

export interface GapInfo {
  weekId: string;
  weekNumber: number;
  startDate: Date;
  role: string;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  preferredBonus: 30,
  availableBonus: 10,
  recencyPenalty: -20,
  fairnessPenalty: -5,
  holidayBonus: 15,
  backToBackPenalty: -25,
};
