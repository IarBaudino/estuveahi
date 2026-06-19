export const Role = {
  CLIENT: "client",
  PHOTOGRAPHER: "photographer",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof Role)[keyof typeof Role];

export const ALL_ROLES = Object.values(Role);
