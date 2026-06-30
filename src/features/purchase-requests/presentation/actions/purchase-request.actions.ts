"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  authActionClient,
  photographerActionClient,
} from "@/shared/lib/safe-action";
import { createPurchaseRequestSchema } from "../../application/schemas/purchase-request.schema";
import {
  archiveRequest,
  archiveClientRequest,
  cancelRequest,
  createPurchaseRequest,
  deleteRequest,
  unarchiveRequest,
  unarchiveClientRequest,
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
    return { success: true as const };
  });

const requestIdSchema = z.object({ requestId: z.string().uuid() });

export const archivePurchaseRequestAction = photographerActionClient
  .schema(requestIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    await archiveRequest(parsedInput.requestId, ctx.user.id);
    revalidatePath(routes.photographer.requests);
    return { success: true as const };
  });

export const unarchivePurchaseRequestAction = photographerActionClient
  .schema(requestIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    await unarchiveRequest(parsedInput.requestId, ctx.user.id);
    revalidatePath(routes.photographer.requests);
    return { success: true as const };
  });

export const deletePurchaseRequestAction = photographerActionClient
  .schema(requestIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    await deleteRequest(parsedInput.requestId, ctx.user.id);
    revalidatePath(routes.photographer.requests);
    revalidatePath(routes.client.requests);
    return { success: true as const };
  });

export const archiveClientPurchaseRequestAction = authActionClient
  .schema(requestIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    await archiveClientRequest(parsedInput.requestId, ctx.user.id);
    revalidatePath(routes.client.requests);
    return { success: true as const };
  });

export const unarchiveClientPurchaseRequestAction = authActionClient
  .schema(requestIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    await unarchiveClientRequest(parsedInput.requestId, ctx.user.id);
    revalidatePath(routes.client.requests);
    return { success: true as const };
  });
