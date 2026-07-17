import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import { unstable_cache } from "next/cache";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type {
  LandingFeaturedCategoryDoc,
  LandingFaqItemDoc,
  LandingSettingsDoc,
  LandingTestimonialDoc,
} from "@/infrastructure/firebase/documents";
import {
  DEFAULT_FEATURED_CATEGORIES,
  DEFAULT_LANDING_COPY,
  DEFAULT_LANDING_FAQ,
  DEFAULT_LANDING_GRAYSCALE,
  DEFAULT_LANDING_HERO_FOCUS,
  DEFAULT_LANDING_IMAGES,
  DEFAULT_LANDING_TESTIMONIALS,
  LANDING_IMAGE_KEYS,
  type LandingCopy,
  type LandingFaqItem,
  type LandingFeaturedCategory,
  type LandingHeroFocus,
  type LandingImageKey,
  type LandingImages,
  type LandingGrayscale,
  type LandingSettings,
  type LandingTestimonial,
} from "@/config/landing.defaults";
import { STORAGE_BUCKETS } from "@/infrastructure/storage/storage.constants";
import { uploadFile, getPublicUrl } from "@/infrastructure/supabase/storage";

const LANDING_DOC_ID = "landing";

function mergeImages(partial?: Record<string, string>): LandingImages {
  const merged = { ...DEFAULT_LANDING_IMAGES };
  if (!partial) return merged;

  for (const key of LANDING_IMAGE_KEYS) {
    if (partial[key]?.trim()) {
      merged[key] = partial[key]!.trim();
    }
  }
  return merged;
}

function mergeGrayscale(partial?: Record<string, boolean>): LandingGrayscale {
  const merged = { ...DEFAULT_LANDING_GRAYSCALE };
  if (!partial) return merged;

  for (const key of LANDING_IMAGE_KEYS) {
    if (typeof partial[key] === "boolean") {
      merged[key] = partial[key]!;
    }
  }
  return merged;
}

function mapFeaturedCategory(doc: LandingFeaturedCategoryDoc): LandingFeaturedCategory {
  return {
    id: doc.id,
    title: doc.title,
    subtitle: doc.subtitle ?? "",
    imageUrl: doc.imageUrl ?? null,
    imageKey: (doc.imageKey as LandingImageKey | null) ?? null,
    eventCategory: doc.eventCategory ?? null,
    href: doc.href ?? null,
    layout: doc.layout,
    grayscale: doc.grayscale,
    sortOrder: doc.sortOrder,
  };
}

function mergeFeaturedCategories(
  partial?: LandingFeaturedCategoryDoc[] | null,
): LandingFeaturedCategory[] {
  if (partial === undefined || partial === null) {
    return DEFAULT_FEATURED_CATEGORIES;
  }
  if (partial.length === 0) return [];
  return partial.map(mapFeaturedCategory).sort((a, b) => a.sortOrder - b.sortOrder);
}

function mapTestimonial(doc: LandingTestimonialDoc): LandingTestimonial {
  return {
    id: doc.id,
    quote: doc.quote,
    name: doc.name,
    role: doc.role,
    avatarUrl: doc.avatarUrl ?? null,
    sortOrder: doc.sortOrder,
  };
}

function mergeTestimonials(partial?: LandingTestimonialDoc[] | null): LandingTestimonial[] {
  if (partial === undefined || partial === null) return DEFAULT_LANDING_TESTIMONIALS;
  if (partial.length === 0) return [];
  return partial.map(mapTestimonial).sort((a, b) => a.sortOrder - b.sortOrder);
}

function mapFaqItem(doc: LandingFaqItemDoc): LandingFaqItem {
  return {
    id: doc.id,
    question: doc.question,
    answer: doc.answer,
    sortOrder: doc.sortOrder,
  };
}

function mergeFaq(partial?: LandingFaqItemDoc[] | null): LandingFaqItem[] {
  if (partial === undefined || partial === null) return DEFAULT_LANDING_FAQ;
  if (partial.length === 0) return [];
  return partial.map(mapFaqItem).sort((a, b) => a.sortOrder - b.sortOrder);
}

function clampPercent(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(100, Math.max(0, value));
}

function mergeHeroFocus(partial?: LandingSettingsDoc["heroFocus"]): LandingHeroFocus {
  return {
    x: clampPercent(partial?.x, DEFAULT_LANDING_HERO_FOCUS.x),
    y: clampPercent(partial?.y, DEFAULT_LANDING_HERO_FOCUS.y),
  };
}

function mergeCopy(partial?: LandingSettingsDoc["copy"]): LandingCopy {
  const merged = { ...DEFAULT_LANDING_COPY };
  if (!partial) return merged;

  for (const key of Object.keys(DEFAULT_LANDING_COPY) as (keyof LandingCopy)[]) {
    const value = partial[key];
    if (typeof value === "string" && value.trim()) {
      merged[key] = value.trim();
    }
  }
  return merged;
}

function emptySettings(): LandingSettings {
  return {
    images: DEFAULT_LANDING_IMAGES,
    grayscale: DEFAULT_LANDING_GRAYSCALE,
    heroFocus: DEFAULT_LANDING_HERO_FOCUS,
    copy: DEFAULT_LANDING_COPY,
    featuredCategories: DEFAULT_FEATURED_CATEGORIES,
    featuredEventIds: [],
    testimonials: DEFAULT_LANDING_TESTIMONIALS,
    faq: DEFAULT_LANDING_FAQ,
  };
}

function mapSettings(data?: LandingSettingsDoc): LandingSettings {
  return {
    images: mergeImages(data?.images),
    grayscale: mergeGrayscale(data?.grayscale),
    heroFocus: mergeHeroFocus(data?.heroFocus),
    copy: mergeCopy(data?.copy),
    featuredCategories: mergeFeaturedCategories(data?.featuredCategories),
    featuredEventIds: data?.featuredEventIds ?? [],
    testimonials: mergeTestimonials(data?.testimonials),
    faq: mergeFaq(data?.faq),
  };
}

async function getLandingDocRef() {
  const db = getDb();
  return db.collection(COLLECTIONS.platformSettings).doc(LANDING_DOC_ID);
}

export async function getLandingSettings(): Promise<LandingSettings> {
  return getCachedLandingSettings();
}

const getCachedLandingSettings = unstable_cache(
  async (): Promise<LandingSettings> => {
    const db = getDbIfConfigured();
    if (!db) return emptySettings();

    try {
      const doc = await db
        .collection(COLLECTIONS.platformSettings)
        .doc(LANDING_DOC_ID)
        .get();

      if (!doc.exists) return emptySettings();

      return mapSettings(doc.data() as LandingSettingsDoc);
    } catch (error) {
      console.error("[getLandingSettings]", error);
      return emptySettings();
    }
  },
  ["landing-settings"],
  { revalidate: 60 },
);

export async function getLandingImages(): Promise<LandingImages> {
  const settings = await getLandingSettings();
  return settings.images;
}

export async function uploadLandingImage(
  key: LandingImageKey,
  buffer: Buffer,
  mimeType: string,
  grayscale: boolean,
): Promise<string> {
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const path = `landing/${key}.${ext}`;

  await uploadFile(
    STORAGE_BUCKETS.covers,
    path,
    buffer,
    mimeType,
    "public, max-age=86400",
  );

  const url = `${getPublicUrl(STORAGE_BUCKETS.covers, path)}?t=${Date.now()}`;
  await setLandingImageUrl(key, url, grayscale);
  return url;
}

async function setLandingImageUrl(
  key: LandingImageKey,
  url: string,
  grayscale: boolean,
): Promise<void> {
  const ref = await getLandingDocRef();
  const doc = await ref.get();
  const data = doc.exists ? (doc.data() as LandingSettingsDoc) : undefined;
  const currentImages = data?.images ?? {};
  const currentGrayscale = data?.grayscale ?? {};

  await ref.set(
    {
      images: { ...currentImages, [key]: url },
      grayscale: { ...currentGrayscale, [key]: grayscale },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function setLandingImageGrayscale(
  key: LandingImageKey,
  grayscale: boolean,
): Promise<LandingGrayscale> {
  const ref = await getLandingDocRef();
  const doc = await ref.get();
  const currentGrayscale = doc.exists
    ? { ...(doc.data() as LandingSettingsDoc).grayscale }
    : {};

  await ref.set(
    {
      grayscale: { ...currentGrayscale, [key]: grayscale },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return mergeGrayscale({ ...currentGrayscale, [key]: grayscale });
}

export async function resetLandingImage(key: LandingImageKey): Promise<LandingSettings> {
  const ref = await getLandingDocRef();
  const doc = await ref.get();
  const data = doc.exists ? (doc.data() as LandingSettingsDoc) : undefined;
  const currentImages = data?.images ? { ...data.images } : {};
  const currentGrayscale = data?.grayscale ? { ...data.grayscale } : {};

  delete currentImages[key];
  delete currentGrayscale[key];

  await ref.set(
    {
      images: currentImages,
      grayscale: currentGrayscale,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return getLandingSettings();
}

export async function setLandingHeroFocus(
  focus: LandingHeroFocus,
): Promise<LandingHeroFocus> {
  const ref = await getLandingDocRef();
  const next = mergeHeroFocus(focus);

  await ref.set(
    {
      heroFocus: next,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return next;
}

export async function updateLandingCopy(copy: LandingCopy): Promise<LandingCopy> {
  const ref = await getLandingDocRef();
  const next = mergeCopy(copy);

  await ref.set(
    {
      copy: next,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return next;
}

export async function restoreDefaultLandingCopy(): Promise<LandingCopy> {
  const ref = await getLandingDocRef();

  await ref.set(
    {
      copy: DEFAULT_LANDING_COPY,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return DEFAULT_LANDING_COPY;
}

export async function saveFeaturedCategory(
  input: Omit<LandingFeaturedCategory, "id"> & { id?: string },
): Promise<LandingFeaturedCategory> {
  const ref = await getLandingDocRef();
  const doc = await ref.get();
  const data = doc.exists ? (doc.data() as LandingSettingsDoc) : undefined;
  const current = mergeFeaturedCategories(data?.featuredCategories);

  const id = input.id?.trim() || randomUUID();
  const category: LandingFeaturedCategory = {
    id,
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    imageUrl: input.imageUrl ?? null,
    imageKey: input.imageKey ?? null,
    eventCategory: input.eventCategory ?? null,
    href: input.href ?? null,
    layout: input.layout,
    grayscale: input.grayscale,
    sortOrder: input.sortOrder,
  };

  const next = [...current.filter((item) => item.id !== id), category].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  await ref.set(
    {
      featuredCategories: next,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return category;
}

export async function deleteFeaturedCategory(categoryId: string): Promise<LandingFeaturedCategory[]> {
  const ref = await getLandingDocRef();
  const doc = await ref.get();
  const data = doc.exists ? (doc.data() as LandingSettingsDoc) : undefined;
  const current = mergeFeaturedCategories(data?.featuredCategories);
  const next = current.filter((item) => item.id !== categoryId);

  await ref.set(
    {
      featuredCategories: next,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return next;
}

export async function uploadFeaturedCategoryImage(
  categoryId: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const path = `landing/categories/${categoryId}.${ext}`;

  await uploadFile(
    STORAGE_BUCKETS.covers,
    path,
    buffer,
    mimeType,
    "public, max-age=86400",
  );

  const url = `${getPublicUrl(STORAGE_BUCKETS.covers, path)}?t=${Date.now()}`;
  const ref = await getLandingDocRef();
  const doc = await ref.get();
  const data = doc.exists ? (doc.data() as LandingSettingsDoc) : undefined;
  const current = mergeFeaturedCategories(data?.featuredCategories);
  const existing = current.find((item) => item.id === categoryId);

  if (!existing) {
    throw new Error("Categoría no encontrada");
  }

  await saveFeaturedCategory({
    ...existing,
    imageUrl: url,
    imageKey: null,
  });

  return url;
}

export async function setFeaturedEventIds(eventIds: string[]): Promise<string[]> {
  const ref = await getLandingDocRef();
  const unique = [...new Set(eventIds)];

  await ref.set(
    {
      featuredEventIds: unique,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return unique;
}

export async function restoreDefaultFeaturedCategories(): Promise<LandingFeaturedCategory[]> {
  const ref = await getLandingDocRef();

  await ref.set(
    {
      featuredCategories: DEFAULT_FEATURED_CATEGORIES,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return DEFAULT_FEATURED_CATEGORIES;
}

async function readTestimonials(): Promise<LandingTestimonial[]> {
  const ref = await getLandingDocRef();
  const doc = await ref.get();
  const data = doc.exists ? (doc.data() as LandingSettingsDoc) : undefined;
  return mergeTestimonials(data?.testimonials);
}

async function readFaq(): Promise<LandingFaqItem[]> {
  const ref = await getLandingDocRef();
  const doc = await ref.get();
  const data = doc.exists ? (doc.data() as LandingSettingsDoc) : undefined;
  return mergeFaq(data?.faq);
}

export async function saveLandingTestimonial(
  input: Omit<LandingTestimonial, "id"> & { id?: string },
): Promise<LandingTestimonial> {
  const ref = await getLandingDocRef();
  const current = await readTestimonials();

  const id = input.id?.trim() || randomUUID();
  const testimonial: LandingTestimonial = {
    id,
    quote: input.quote.trim(),
    name: input.name.trim(),
    role: input.role.trim(),
    avatarUrl: input.avatarUrl?.trim() || null,
    sortOrder: input.sortOrder,
  };

  const next = [...current.filter((item) => item.id !== id), testimonial].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  await ref.set(
    {
      testimonials: next,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return testimonial;
}

export async function deleteLandingTestimonial(testimonialId: string): Promise<LandingTestimonial[]> {
  const ref = await getLandingDocRef();
  const current = await readTestimonials();
  const next = current.filter((item) => item.id !== testimonialId);

  await ref.set(
    {
      testimonials: next,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return next;
}

export async function restoreDefaultLandingTestimonials(): Promise<LandingTestimonial[]> {
  const ref = await getLandingDocRef();

  await ref.set(
    {
      testimonials: DEFAULT_LANDING_TESTIMONIALS,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return DEFAULT_LANDING_TESTIMONIALS;
}

export async function saveLandingFaqItem(
  input: Omit<LandingFaqItem, "id"> & { id?: string },
): Promise<LandingFaqItem> {
  const ref = await getLandingDocRef();
  const current = await readFaq();

  const id = input.id?.trim() || randomUUID();
  const item: LandingFaqItem = {
    id,
    question: input.question.trim(),
    answer: input.answer.trim(),
    sortOrder: input.sortOrder,
  };

  const next = [...current.filter((item) => item.id !== id), item].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  await ref.set(
    {
      faq: next,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return item;
}

export async function deleteLandingFaqItem(faqId: string): Promise<LandingFaqItem[]> {
  const ref = await getLandingDocRef();
  const current = await readFaq();
  const next = current.filter((item) => item.id !== faqId);

  await ref.set(
    {
      faq: next,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return next;
}

export async function restoreDefaultLandingFaq(): Promise<LandingFaqItem[]> {
  const ref = await getLandingDocRef();

  await ref.set(
    {
      faq: DEFAULT_LANDING_FAQ,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return DEFAULT_LANDING_FAQ;
}

export async function getLandingSettingsForAdmin(): Promise<LandingSettings> {
  return getLandingSettings();
}
