export const ROLES = ["TECH", "SE", "UL", "ESCALATION"] as const;

export const ROLE_LABELS: Record<string, string> = {
  TECH: "Technician",
  SE: "Systems Engineer",
  UL: "UL",
  ESCALATION: "Escalation",
};

export const ROLE_COLORS: Record<string, string> = {
  TECH: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  SE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  UL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ESCALATION: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

export const PREFERENCE_LABELS: Record<string, string> = {
  PREFERRED: "Preferred",
  AVAILABLE: "Available",
  UNAVAILABLE: "Unavailable (PTO)",
};

export const PREFERENCE_COLORS: Record<string, string> = {
  PREFERRED: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200",
  AVAILABLE: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200",
  UNAVAILABLE: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200",
};

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  SUGGESTED: "Suggested",
  CONFIRMED: "Confirmed",
  LOCKED: "Locked",
};

export const ASSIGNMENT_STATUS_COLORS: Record<string, string> = {
  SUGGESTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  LOCKED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export const QUARTER_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const SWAP_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};
