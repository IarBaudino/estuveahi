import { FieldValue } from "firebase-admin/firestore";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { LandingSettingsDoc } from "@/infrastructure/firebase/documents";
import {
  DEFAULT_LANDING_GRAYSCALE,
  DEFAULT_LANDING_IMAGES,
  LANDING_IMAGE_KEYS,
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

function mapSettings(data?: Pick<LandingSettingsDoc, "images" | "grayscale">): LandingSettings {
  return {
    images: mergeImages(data?.images),
    grayscale: mergeGrayscale(data?.grayscale),
  };
}

export async function getLandingSettings(): Promise<LandingSettings> {
  const db = getDbIfConfigured();
  if (!db) {
    return {
      images: DEFAULT_LANDING_IMAGES,
      grayscale: DEFAULT_LANDING_GRAYSCALE,
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
      };
    }

    return mapSettings(doc.data() as LandingSettingsDoc);
  } catch (error) {
    console.error("[getLandingSettings]", error);
    return {
      images: DEFAULT_LANDING_IMAGES,
      grayscale: DEFAULT_LANDING_GRAYSCALE,
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
  const db = getDb();
  const ref = db.collection(COLLECTIONS.platformSettings).doc(LANDING_DOC_ID);
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
  const db = getDb();
  const ref = db.collection(COLLECTIONS.platformSettings).doc(LANDING_DOC_ID);
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
  const db = getDb();
  const ref = db.collection(COLLECTIONS.platformSettings).doc(LANDING_DOC_ID);
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

export async function getLandingSettingsForAdmin(): Promise<LandingSettings> {
  return getLandingSettings();
}
