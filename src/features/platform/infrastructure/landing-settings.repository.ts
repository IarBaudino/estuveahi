import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type {
  LandingFeaturedCategoryDoc,
  LandingSettingsDoc,
} from "@/infrastructure/firebase/documents";
import {
  DEFAULT_FEATURED_CATEGORIES,
  DEFAULT_LANDING_GRAYSCALE,
  DEFAULT_LANDING_IMAGES,
  LANDING_IMAGE_KEYS,
  type LandingFeaturedCategory,
  type LandingImageKey,
  type LandingImages,
  type LandingGrayscale,
  type LandingSettings,
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
  partial?: LandingFeaturedCategoryDoc[],
): LandingFeaturedCategory[] {
  if (!partial?.length) return DEFAULT_FEATURED_CATEGORIES;
  return partial.map(mapFeaturedCategory).sort((a, b) => a.sortOrder - b.sortOrder);
}

function mapSettings(
  data?: Pick<LandingSettingsDoc, "images" | "grayscale" | "featuredCategories" | "featuredEventIds">,
): LandingSettings {
  return {
    images: mergeImages(data?.images),
    grayscale: mergeGrayscale(data?.grayscale),
    featuredCategories: mergeFeaturedCategories(data?.featuredCategories),
    featuredEventIds: data?.featuredEventIds ?? [],
  };
}

async function getLandingDocRef() {
  const db = getDb();
  return db.collection(COLLECTIONS.platformSettings).doc(LANDING_DOC_ID);
}

export async function getLandingSettings(): Promise<LandingSettings> {
  const db = getDbIfConfigured();
  if (!db) {
    return {
      images: DEFAULT_LANDING_IMAGES,
      grayscale: DEFAULT_LANDING_GRAYSCALE,
      featuredCategories: DEFAULT_FEATURED_CATEGORIES,
      featuredEventIds: [],
    };
  }

  try {
    const doc = await db
      .collection(COLLECTIONS.platformSettings)
      .doc(LANDING_DOC_ID)
      .get();

    if (!doc.exists) {
      return {
        images: DEFAULT_LANDING_IMAGES,
        grayscale: DEFAULT_LANDING_GRAYSCALE,
        featuredCategories: DEFAULT_FEATURED_CATEGORIES,
        featuredEventIds: [],
      };
    }

    return mapSettings(doc.data() as LandingSettingsDoc);
  } catch (error) {
    console.error("[getLandingSettings]", error);
    return {
      images: DEFAULT_LANDING_IMAGES,
      grayscale: DEFAULT_LANDING_GRAYSCALE,
      featuredCategories: DEFAULT_FEATURED_CATEGORIES,
      featuredEventIds: [],
    };
  }
}

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

  return mapSettings({ images: currentImages, grayscale: currentGrayscale });
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

export async function getLandingSettingsForAdmin(): Promise<LandingSettings> {
  return getLandingSettings();
}
