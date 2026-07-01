import { z } from "zod";
import { LANDING_IMAGE_KEYS } from "@/config/landing.defaults";
import { EventCategory } from "@/domain/enums/event-category";

export const landingImageKeySchema = z.enum(LANDING_IMAGE_KEYS);

export const uploadLandingImageSchema = z.object({
  key: landingImageKeySchema,
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileBase64: z.string().min(1),
  grayscale: z.boolean(),
});

export type UploadLandingImageInput = z.infer<typeof uploadLandingImageSchema>;

export const updateLandingGrayscaleSchema = z.object({
  key: landingImageKeySchema,
  grayscale: z.boolean(),
});

export const resetLandingImageSchema = z.object({
  key: landingImageKeySchema,
});

export const saveFeaturedCategorySchema = z.object({
  id: z.string().min(1).max(64).optional(),
  title: z.string().min(1).max(80),
  subtitle: z.string().max(120).default(""),
  imageUrl: z.string().url().nullable().optional(),
  imageKey: landingImageKeySchema.nullable().optional(),
  eventCategory: z.enum(Object.values(EventCategory) as [string, ...string[]]).nullable().optional(),
  href: z.string().url().nullable().optional(),
  layout: z.enum(["wide", "narrow"]),
  grayscale: z.boolean(),
  sortOrder: z.number().int().min(0).max(99),
});

export const deleteFeaturedCategorySchema = z.object({
  id: z.string().min(1).max(64),
});

export const uploadFeaturedCategoryImageSchema = z.object({
  categoryId: z.string().min(1).max(64),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileBase64: z.string().min(1),
});

export const setFeaturedEventIdsSchema = z.object({
  eventIds: z.array(z.string().uuid()).max(6),
});

export const saveLandingTestimonialSchema = z.object({
  id: z.string().min(1).max(64).optional(),
  quote: z.string().min(1).max(600),
  name: z.string().min(1).max(80),
  role: z.string().min(1).max(80),
  avatarUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().min(0).max(99),
});

export const deleteLandingTestimonialSchema = z.object({
  id: z.string().min(1).max(64),
});

export const saveLandingFaqItemSchema = z.object({
  id: z.string().min(1).max(64).optional(),
  question: z.string().min(1).max(200),
  answer: z.string().min(1).max(1200),
  sortOrder: z.number().int().min(0).max(99),
});

export const deleteLandingFaqItemSchema = z.object({
  id: z.string().min(1).max(64),
});
