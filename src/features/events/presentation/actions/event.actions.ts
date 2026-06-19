"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  actionClient,
  photographerActionClient,
} from "@/shared/lib/safe-action";
import {
  createEventSchema,
  searchEventsSchema,
  updateEventSchema,
} from "../../application/schemas/event.schema";
import {
  archiveEvent,
  createEvent,
  deleteEvent,
  publishEvent,
  searchPublicEvents,
  updateEvent,
} from "../../infrastructure/event.repository";
import { routes } from "@/config/routes";

export const createEventAction = photographerActionClient
  .schema(createEventSchema)
  .action(async ({ parsedInput, ctx }) => {
    const event = await createEvent(ctx.user.id, parsedInput);
    revalidatePath(routes.photographer.events);
    return { event };
  });

export const updateEventAction = photographerActionClient
  .schema(updateEventSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...rest } = parsedInput;
    const event = await updateEvent(id, ctx.user.id, rest);
    revalidatePath(routes.photographer.event(event.id));
    revalidatePath(routes.photographer.events);
    if (event.status === "published") {
      revalidatePath(routes.event(event.slug));
    }
    return { event };
  });

export const publishEventAction = photographerActionClient
  .schema(z.object({ eventId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const event = await publishEvent(parsedInput.eventId, ctx.user.id);
    revalidatePath(routes.event(event.slug));
    revalidatePath(routes.photographer.events);
    return { event };
  });

export const archiveEventAction = photographerActionClient
  .schema(z.object({ eventId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const event = await archiveEvent(parsedInput.eventId, ctx.user.id);
    revalidatePath(routes.photographer.events);
    return { event };
  });

export const deleteEventAction = photographerActionClient
  .schema(z.object({ eventId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    await deleteEvent(parsedInput.eventId, ctx.user.id);
    revalidatePath(routes.photographer.events);
    return { success: true };
  });

export const searchEventsAction = actionClient
  .schema(searchEventsSchema)
  .action(async ({ parsedInput }) => searchPublicEvents(parsedInput));
