import {
  getBucketAndPath,
  PREVIEW_MAX_PX,
  PREVIEW_QUALITY,
  THUMBNAIL_MAX_PX,
  THUMBNAIL_QUALITY,
} from "./storage.constants";
import { createWatermarkSvg } from "./watermark";
import { uploadFile } from "@/infrastructure/supabase/storage";
import sharp from "./sharp";

async function rasterizeWatermark(width: number, height: number): Promise<Buffer> {
  const watermarkSvg = createWatermarkSvg(width, height);

  return sharp(watermarkSvg, { density: 300 })
    .resize(width, height, { fit: "fill" })
    .png()
    .toBuffer();
}

/** Aplica la marca de agua al servir preview/thumbnail (todas las fotos, incluidas las ya subidas). */
export async function applyServedPhotoWatermark(
  imageBuffer: Buffer,
  quality = PREVIEW_QUALITY,
): Promise<Buffer> {
  const image = sharp(imageBuffer).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? PREVIEW_MAX_PX;
  const height = meta.height ?? PREVIEW_MAX_PX;

  const watermarkPng = await rasterizeWatermark(width, height);

  return image
    .composite([{ input: watermarkPng, blend: "over" }])
    .webp({ quality, effort: 4 })
    .toBuffer();
}

async function resizeVariant(
  originalBuffer: Buffer,
  maxPx: number,
  quality: number,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const buffer = await sharp(originalBuffer)
    .rotate()
    .resize(maxPx, maxPx, { fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toBuffer();

  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? maxPx;
  const height = meta.height ?? maxPx;

  return { buffer, width, height };
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
