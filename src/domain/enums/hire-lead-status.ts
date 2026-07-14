export const HireLeadStatus = {
  NOTIFIED: "notified",
  INTERESTED: "interested",
  PASSED: "passed",
} as const;

export type HireLeadStatus =
  (typeof HireLeadStatus)[keyof typeof HireLeadStatus];

export const HIRE_LEAD_STATUS_LABELS: Record<HireLeadStatus, string> = {
  notified: "Pendiente",
  interested: "Interesadx",
  passed: "No me interesa",
};
