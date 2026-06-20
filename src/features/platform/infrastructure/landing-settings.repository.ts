import { FieldValue } from "firebase-admin/firestore";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { LandingSettingsDoc } from "@/infrastructure/firebase/documents";
import {
  DEFAULT_LANDING_IMAGES,
  LANDING_IMAGE_KEYS,
  type LandingImageKey,
  type LandingImages,
} from "@/config/landing.defaults";
import { STORAGE_BUCKETS } from "@/infrastructure/storage/storage.constants";
import { uploadFile, getPublicUrl } from "@/infrastructure/supabase/storage";

const LANDING_DOC_ID = "landing";

function mergeWithDefaults(partial?: Record<string, string>): LandingImages {
  const merged = { ...DEFAULT_LANDING_IMAGES };
  if (!partial) return merged;

  for (const key of LANDING_IMAGE_KEYS) {
    if (partial[key]?.trim()) {
      merged[key] = partial[key]!.trim();
    }
  }
  return merged;
}

export async function getLandingImages(): Promise<LandingImages> {
  const db = getDbIfConfigured();
  if (!db) return DEFAULT_LANDING_IMAGES;

  try {
    const doc = await db
      .collection(COLLECTIONS.platformSettings)
      .doc(LANDING_DOC_ID)
      .get();

    if (!doc.exists) return DEFAULT_LANDING_IMAGES;
    const data = doc.data() as LandingSettingsDoc;
    return mergeWithDefaults(data.images);
  } catch (error) {
    console.error("[getLandingImages]", error);
    return DEFAULT_LANDING_IMAGES;
  }
}

export async function uploadLandingImage(
  key: LandingImageKey,
  buffer: Buffer,
  mimeType: string,
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
  await setLandingImageUrl(key, url);
  return url;
}

async function setLandingImageUrl(key: LandingImageKey, url: string): Promise<void> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.platformSettings).doc(LANDING_DOC_ID);
  const doc = await ref.get();
  const current = doc.exists ? (doc.data() as LandingSettingsDoc).images : {};

  await ref.set(
    {
      images: { ...current, [key]: url },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function resetLandingImage(key: LandingImageKey): Promise<LandingImages> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.platformSettings).doc(LANDING_DOC_ID);
  const doc = await ref.get();
  const current = doc.exists ? { ...(doc.data() as LandingSettingsDoc).images } : {};

  delete current[key];

  await ref.set(
    {
      images: current,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return mergeWithDefaults(current);
}

export async function getLandingImagesForAdmin(): Promise<LandingImages> {
  return getLandingImages();
}
