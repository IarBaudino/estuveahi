import { z } from "zod";

export const createPurchaseRequestSchema = z.object({
  photoId: z.string().uuid(),
  message: z.string().max(500).optional(),
});

export type CreatePurchaseRequestInput = z.infer<
  typeof createPurchaseRequestSchema
>;

export const managePurchaseRequestSchema = z.object({
  requestId: z.string().uuid(),
  quotedPriceCents: z.number().int().min(0).optional(),
});
