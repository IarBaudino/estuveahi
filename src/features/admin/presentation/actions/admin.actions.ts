"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminActionClient } from "@/shared/lib/safe-action";
import {
  adminArchiveEvent,
  adminDeleteEvent,
  createEvent,
} from "@/features/events/infrastructure/event.repository";
import { adminCreateEventSchema } from "@/features/events/application/schemas/event.schema";
import { routes } from "@/config/routes";

export const adminCreateEventAction = adminActionClient
  .schema(adminCreateEventSchema)
  .action(async ({ parsedInput }) => {
    const { photographerId, ...input } = parsedInput;
    const event = await createEvent(photographerId, input);
    revalidatePath(routes.admin.events);
    revalidatePath(routes.photographer.events);
    return { event };
  });

export const adminArchiveEventAction = adminActionClient
  .schema(z.object({ eventId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    await adminArchiveEvent(parsedInput.eventId);
    revalidatePath(routes.admin.events);
    return { success: true };
  });

export const adminDeleteEventAction = adminActionClient
  .schema(z.object({ eventId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    await adminDeleteEvent(parsedInput.eventId);
    revalidatePath(routes.admin.events);
    revalidatePath(routes.admin.dashboard);
    return { success: true };
  });
