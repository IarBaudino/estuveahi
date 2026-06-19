export const EventCategory = {
  CONCERT: "concert",
  FESTIVAL: "festival",
  THEATER: "theater",
  SPORTS: "sports",
  CONFERENCE: "conference",
  CONVENTION: "convention",
  OTHER: "other",
} as const;

export type EventCategory = (typeof EventCategory)[keyof typeof EventCategory];

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  concert: "Recital",
  festival: "Festival",
  theater: "Teatro",
  sports: "Deportes",
  conference: "Congreso",
  convention: "Convención",
  other: "Otro",
};
