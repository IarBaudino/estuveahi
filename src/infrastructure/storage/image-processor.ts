import {
  getBucketAndPath,
  PREVIEW_MAX_PX,
  PREVIEW_QUALITY,
  THUMBNAIL_MAX_PX,
  THUMBNAIL_QUALITY,
} from "./storage.constants";
import { createWatermarkPng } from "./watermark";
import { uploadFile } from "@/infrastructure/supabase/storage";
import sharp from "./sharp";

/**
 * Aplica marca de agua. Si falla, lanza error (NUNCA devolver imagen limpia).
 */
export async function applyServedPhotoWatermark(
  imageBuffer: Buffer,
  quality = PREVIEW_QUALITY,
): Promise<Buffer> {
  const meta = await sharp(imageBuffer).rotate().metadata();
  const width = meta.width ?? PREVIEW_MAX_PX;
  const height = meta.height ?? PREVIEW_MAX_PX;

  const watermarkPng = await createWatermarkPng(width, height);
  return sharp(imageBuffer)
    .rotate()
    .composite([{ input: watermarkPng, top: 0, left: 0 }])
    .webp({ quality, effort: 4 })
    .toBuffer();
}

async function resizeVariant(
  originalBuffer: Buffer,
  maxPx: number,
  quality: number,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const resized = await sharp(originalBuffer)
    .rotate()
    .resize(maxPx, maxPx, { fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const width = meta.width ?? maxPx;
  const height = meta.height ?? maxPx;

  // Marca de agua YA en storage: /api/media solo sirve el archivo.
  const watermarked = await applyServedPhotoWatermark(resized, quality);

  return { buffer: watermarked, width, height };
}

export async function processAndUploadVariants(
  originalBuffer: Buffer,
  paths: { preview: string; thumbnail: string },
): Promise<{ width: number; height: number }> {
  const [preview, thumbnail] = await Promise.all([
    resizeVariant(originalBuffer, PREVIEW_MAX_PX, PREVIEW_QUALITY),
    resizeVariant(originalBuffer, THUMBNAIL_MAX_PX, THUMBNAIL_QUALITY),
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
