export const EventStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];
