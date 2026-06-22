"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  authActionClient,
  photographerActionClient,
} from "@/shared/lib/safe-action";
import { createPurchaseRequestSchema } from "../../application/schemas/purchase-request.schema";
import {
  cancelRequest,
  createPurchaseRequest,
  updateRequestStatus,
} from "../../infrastructure/purchase-request.repository";
import { routes } from "@/config/routes";

export const createPurchaseRequestAction = authActionClient
  .schema(createPurchaseRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const request = await createPurchaseRequest(ctx.user.id, parsedInput);
    revalidatePath(routes.client.requests);
    revalidatePath(routes.photographer.requests);
    return { success: true as const, requestId: request.id };
  });

export const approvePurchaseRequestAction = photographerActionClient
  .schema(
    z.object({
      requestId: z.string().uuid(),
      quotedPriceCents: z.number().int().min(0),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const request = await updateRequestStatus(
      parsedInput.requestId,
      ctx.user.id,
      "approved",
      parsedInput.quotedPriceCents,
    );
    revalidatePath(routes.photographer.requests);
    revalidatePath(routes.client.requests);
    return { request };
  });

export const rejectPurchaseRequestAction = photographerActionClient
  .schema(z.object({ requestId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const request = await updateRequestStatus(
      parsedInput.requestId,
      ctx.user.id,
      "rejected",
    );
    revalidatePath(routes.photographer.requests);
    return { request };
  });

export const completePurchaseRequestAction = photographerActionClient
  .schema(z.object({ requestId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const request = await updateRequestStatus(
      parsedInput.requestId,
      ctx.user.id,
      "completed",
    );
    revalidatePath(routes.photographer.requests);
    return { request };
  });

export const cancelPurchaseRequestAction = authActionClient
  .schema(z.object({ requestId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    await cancelRequest(parsedInput.requestId, ctx.user.id);
    revalidatePath(routes.client.requests);
    return { success: true };
  });
