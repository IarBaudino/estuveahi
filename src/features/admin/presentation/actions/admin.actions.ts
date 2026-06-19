"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminActionClient } from "@/shared/lib/safe-action";
import {
  adminArchiveEvent,
  adminDeleteEvent,
} from "@/features/events/infrastructure/event.repository";
import { routes } from "@/config/routes";

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
    return { success: true };
  });
