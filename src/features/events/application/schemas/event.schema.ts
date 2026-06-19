import { z } from "zod";
import { EventCategory } from "@/domain/enums/event-category";

const eventCategories = [
  EventCategory.CONCERT,
  EventCategory.FESTIVAL,
  EventCategory.THEATER,
  EventCategory.SPORTS,
  EventCategory.CONFERENCE,
  EventCategory.CONVENTION,
  EventCategory.OTHER,
] as const;

export const createEventSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(120),
  description: z.string().max(2000).optional(),
  category: z.enum(eventCategories),
  venue: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(2),
  eventDate: z.string().min(1, "Fecha requerida"),
  isPublic: z.boolean(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const searchEventsSchema = z.object({
  q: z.string().optional(),
  category: z.enum(eventCategories).optional(),
  city: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchEventsInput = z.infer<typeof searchEventsSchema>;
