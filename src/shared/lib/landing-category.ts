import type { LandingFeaturedCategory, LandingImages } from "@/config/landing.defaults";
import { DEFAULT_LANDING_IMAGES } from "@/config/landing.defaults";
import { routes } from "@/config/routes";

export function resolveFeaturedCategoryImage(
  category: LandingFeaturedCategory,
  images: LandingImages,
): string {
  if (category.imageUrl?.trim()) return category.imageUrl.trim();
  if (category.imageKey && images[category.imageKey]) return images[category.imageKey];
  return DEFAULT_LANDING_IMAGES.hero;
}

export function resolveFeaturedCategoryHref(category: LandingFeaturedCategory): string {
  if (category.href?.trim()) return category.href.trim();
  if (category.eventCategory?.trim()) {
    return `${routes.events}?category=${encodeURIComponent(category.eventCategory.trim())}`;
  }
  return routes.events;
}

export function categoryLayoutClasses(layout: LandingFeaturedCategory["layout"]) {
  return layout === "wide"
    ? { span: "md:col-span-8", titleClass: "text-headline-lg" }
    : { span: "md:col-span-4", titleClass: "text-headline-md" };
}

export function isCategoryGrayscale(
  category: LandingFeaturedCategory,
  fallback: boolean,
): boolean {
  return category.grayscale ?? fallback;
}
