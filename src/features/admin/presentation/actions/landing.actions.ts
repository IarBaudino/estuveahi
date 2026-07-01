"use server";

import { revalidatePath } from "next/cache";
import { adminActionClient } from "@/shared/lib/safe-action";
import {
  deleteFeaturedCategorySchema,
  deleteLandingFaqItemSchema,
  deleteLandingTestimonialSchema,
  resetLandingImageSchema,
  saveFeaturedCategorySchema,
  saveLandingFaqItemSchema,
  saveLandingTestimonialSchema,
  setFeaturedEventIdsSchema,
  updateLandingGrayscaleSchema,
  uploadFeaturedCategoryImageSchema,
  uploadLandingImageSchema,
} from "@/features/platform/application/schemas/landing.schema";
import {
  deleteFeaturedCategory,
  deleteLandingFaqItem,
  deleteLandingTestimonial,
  restoreDefaultFeaturedCategories,
  restoreDefaultLandingFaq,
  restoreDefaultLandingTestimonials,
  resetLandingImage,
  saveFeaturedCategory,
  saveLandingFaqItem,
  saveLandingTestimonial,
  setFeaturedEventIds,
  setLandingImageGrayscale,
  uploadFeaturedCategoryImage,
  uploadLandingImage,
} from "@/features/platform/infrastructure/landing-settings.repository";
import { routes } from "@/config/routes";

function revalidateLanding() {
  revalidatePath(routes.home);
  revalidatePath(routes.admin.content);
}

export const uploadLandingImageAction = adminActionClient
  .schema(uploadLandingImageSchema)
  .action(async ({ parsedInput }) => {
    const { fileBase64, key, mimeType, grayscale } = parsedInput;
    const buffer = Buffer.from(fileBase64, "base64");
    const url = await uploadLandingImage(key, buffer, mimeType, grayscale);
    revalidateLanding();
    return { url };
  });

export const updateLandingGrayscaleAction = adminActionClient
  .schema(updateLandingGrayscaleSchema)
  .action(async ({ parsedInput }) => {
    const grayscale = await setLandingImageGrayscale(parsedInput.key, parsedInput.grayscale);
    revalidateLanding();
    return { grayscale };
  });

export const resetLandingImageAction = adminActionClient
  .schema(resetLandingImageSchema)
  .action(async ({ parsedInput }) => {
    const settings = await resetLandingImage(parsedInput.key);
    revalidateLanding();
    return { settings };
  });

export const saveFeaturedCategoryAction = adminActionClient
  .schema(saveFeaturedCategorySchema)
  .action(async ({ parsedInput }) => {
    const category = await saveFeaturedCategory(parsedInput);
    revalidateLanding();
    return { category };
  });

export const deleteFeaturedCategoryAction = adminActionClient
  .schema(deleteFeaturedCategorySchema)
  .action(async ({ parsedInput }) => {
    const categories = await deleteFeaturedCategory(parsedInput.id);
    revalidateLanding();
    return { categories };
  });

export const restoreDefaultFeaturedCategoriesAction = adminActionClient.action(async () => {
  const categories = await restoreDefaultFeaturedCategories();
  revalidateLanding();
  return { categories };
});

export const uploadFeaturedCategoryImageAction = adminActionClient
  .schema(uploadFeaturedCategoryImageSchema)
  .action(async ({ parsedInput }) => {
    const buffer = Buffer.from(parsedInput.fileBase64, "base64");
    const url = await uploadFeaturedCategoryImage(
      parsedInput.categoryId,
      buffer,
      parsedInput.mimeType,
    );
    revalidateLanding();
    return { url };
  });

export const setFeaturedEventIdsAction = adminActionClient
  .schema(setFeaturedEventIdsSchema)
  .action(async ({ parsedInput }) => {
    const eventIds = await setFeaturedEventIds(parsedInput.eventIds);
    revalidateLanding();
    return { eventIds };
  });

export const saveLandingTestimonialAction = adminActionClient
  .schema(saveLandingTestimonialSchema)
  .action(async ({ parsedInput }) => {
    const testimonial = await saveLandingTestimonial(parsedInput);
    revalidateLanding();
    return { testimonial };
  });

export const deleteLandingTestimonialAction = adminActionClient
  .schema(deleteLandingTestimonialSchema)
  .action(async ({ parsedInput }) => {
    const testimonials = await deleteLandingTestimonial(parsedInput.id);
    revalidateLanding();
    return { testimonials };
  });

export const restoreDefaultLandingTestimonialsAction = adminActionClient.action(async () => {
  const testimonials = await restoreDefaultLandingTestimonials();
  revalidateLanding();
  return { testimonials };
});

export const saveLandingFaqItemAction = adminActionClient
  .schema(saveLandingFaqItemSchema)
  .action(async ({ parsedInput }) => {
    const item = await saveLandingFaqItem(parsedInput);
    revalidateLanding();
    return { item };
  });

export const deleteLandingFaqItemAction = adminActionClient
  .schema(deleteLandingFaqItemSchema)
  .action(async ({ parsedInput }) => {
    const faq = await deleteLandingFaqItem(parsedInput.id);
    revalidateLanding();
    return { faq };
  });

export const restoreDefaultLandingFaqAction = adminActionClient.action(async () => {
  const faq = await restoreDefaultLandingFaq();
  revalidateLanding();
  return { faq };
});
