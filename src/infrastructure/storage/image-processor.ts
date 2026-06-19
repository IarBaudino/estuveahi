import sharp from "sharp";
import {
  getBucketAndPath,
  PREVIEW_MAX_PX,
  PREVIEW_QUALITY,
  THUMBNAIL_MAX_PX,
  THUMBNAIL_QUALITY,
} from "./storage.constants";
import { createWatermarkSvg, shortPhotoLabel } from "./watermark";
import { uploadFile } from "@/infrastructure/supabase/storage";

async function applyVariant(
  originalBuffer: Buffer,
  maxPx: number,
  quality: number,
  watermarkLabel: string,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const resized = sharp(originalBuffer)
    .rotate()
    .resize(maxPx, maxPx, { fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 6 });

  const resizedBuffer = await resized.toBuffer();
  const meta = await sharp(resizedBuffer).metadata();
  const width = meta.width ?? maxPx;
  const height = meta.height ?? maxPx;

  const watermark = createWatermarkSvg(width, height, watermarkLabel);

  const buffer = await sharp(resizedBuffer)
    .composite([{ input: watermark, blend: "over" }])
    .webp({ quality, effort: 6 })
    .toBuffer();

  return { buffer, width, height };
}

export async function processAndUploadVariants(
  originalBuffer: Buffer,
  paths: { preview: string; thumbnail: string },
  photoId: string,
): Promise<{ width: number; height: number }> {
  const label = shortPhotoLabel(photoId);

  const [preview, thumbnail] = await Promise.all([
    applyVariant(originalBuffer, PREVIEW_MAX_PX, PREVIEW_QUALITY, label),
    applyVariant(originalBuffer, THUMBNAIL_MAX_PX, THUMBNAIL_QUALITY, label),
  ]);

  const previewPath = getBucketAndPath(paths.preview);
  const thumbnailPath = getBucketAndPath(paths.thumbnail);

  await Promise.all([
    uploadFile(previewPath.bucket, previewPath.path, preview.buffer, "image/webp"),
    uploadFile(
      thumbnailPath.bucket,
      thumbnailPath.path,
      thumbnail.buffer,
      "image/webp",
    ),
  ]);

  return { width: preview.width, height: preview.height };
}

export async function uploadOriginal(
  buffer: Buffer,
  fullPath: string,
  mimeType: string,
): Promise<void> {
  const stripped = await sharp(buffer).rotate().toBuffer();
  const { bucket, path } = getBucketAndPath(fullPath);
  await uploadFile(bucket, path, stripped, mimeType);
}
