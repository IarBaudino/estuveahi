export const PhotographerApplicationStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type PhotographerApplicationStatus =
  (typeof PhotographerApplicationStatus)[keyof typeof PhotographerApplicationStatus];
