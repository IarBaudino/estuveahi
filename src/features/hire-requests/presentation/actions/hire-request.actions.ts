"use server";

import { revalidatePath } from "next/cache";
import {
  actionClient,
  adminActionClient,
  photographerActionClient,
} from "@/shared/lib/safe-action";
import { routes } from "@/config/routes";
import {
  createHireRequestSchema,
  notifyHirePhotographersSchema,
  updateHireLeadStatusSchema,
  updateHireRequestStatusSchema,
} from "../../application/schemas/hire-request.schema";
import {
  createHireRequest,
  updateHireRequestStatus,
} from "../../infrastructure/hire-request.repository";
import {
  notifyPhotographersOfHireRequest,
  updateHireLeadStatus,
} from "../../infrastructure/hire-lead.repository";

export const createHireRequestAction = actionClient
  .schema(createHireRequestSchema)
  .action(async ({ parsedInput }) => {
    const request = await createHireRequest(parsedInput);
    return { success: true as const, id: request.id };
  });

export const updateHireRequestStatusAction = adminActionClient
  .schema(updateHireRequestStatusSchema)
  .action(async ({ parsedInput }) => {
    await updateHireRequestStatus(parsedInput.id, parsedInput.status);
    revalidatePath(routes.admin.requests);
    return { success: true as const };
  });

export const notifyHirePhotographersAction = adminActionClient
  .schema(notifyHirePhotographersSchema)
  .action(async ({ parsedInput }) => {
    const result = await notifyPhotographersOfHireRequest(
      parsedInput.hireRequestId,
      parsedInput.photographerIds,
    );
    revalidatePath(routes.admin.requests);
    revalidatePath(routes.photographer.requests);
    return { success: true as const, ...result };
  });

export const updateHireLeadStatusAction = photographerActionClient
  .schema(updateHireLeadStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    await updateHireLeadStatus(
      parsedInput.leadId,
      ctx.user.id,
      parsedInput.status,
    );
    revalidatePath(routes.photographer.requests);
    return { success: true as const };
  });
