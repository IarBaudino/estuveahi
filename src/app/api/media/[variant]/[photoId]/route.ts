import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseStorageConfigured } from "@/infrastructure/supabase/config";
import { downloadFile, uploadFile } from "@/infrastructure/supabase/storage";
import { applyServedPhotoWatermark } from "@/infrastructure/storage/image-processor";
import {
  PREVIEW_QUALITY,
  THUMBNAIL_QUALITY,
} from "@/infrastructure/storage/storage.constants";
import { resolvePhotoMediaAccess } from "@/features/photos/infrastructure/media-access";
import type { MediaVariant } from "@/shared/lib/media-url";
import { siteConfig } from "@/config/site";
import { getServerSessionUser } from "@/infrastructure/auth/session";
import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";

export const runtime = "nodejs";

const VALID_VARIANTS = new Set<MediaVariant>(["thumbnail", "preview"]);

function isAllowedReferer(request: NextRequest): boolean {
  const referer = request.headers.get("referer");
  if (!referer) return true;

  try {
    const refHost = new URL(referer).host;
    const reqHost = request.headers.get("host") ?? "";
    const appHost = new URL(siteConfig.url).host;
    return refHost === reqHost || refHost === appHost;
  } catch {
    return false;
  }
}

function mediaResponse(body: Buffer, watermarked: boolean) {
  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Watermarked": watermarked ? "1" : "0",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "DENY",
      "Permissions-Policy": "interest-cohort=()",
    },
  });
}

/** Reescribe la variante con marca y marca el doc (fotos viejas). No bloquea la respuesta. */
async function backfillWatermarkedVariant(input: {
  photoId: string;
  bucket: string;
  path: string;
  buffer: Buffer;
}): Promise<void> {
  try {
    await uploadFile(input.bucket, input.path, input.buffer, "image/webp");
    const db = getDbIfConfigured();
    if (!db) return;
    await db.collection(COLLECTIONS.photos).doc(input.photoId).update({
      watermarkBakedIn: true,
    });
  } catch (error) {
    console.error("[api/media] watermark backfill failed:", input.photoId, error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ variant: string; photoId: string }> },
) {
  const { variant, photoId } = await params;

  if (!VALID_VARIANTS.has(variant as MediaVariant)) {
    return NextResponse.json({ error: "Variante inválida" }, { status: 400 });
  }

  if (!isAllowedReferer(request)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  let access = await resolvePhotoMediaAccess(photoId, variant as MediaVariant);

  if (!access) {
    const user = await getServerSessionUser();
    const viewer = user ? { id: user.id, role: user.role } : undefined;
    access = await resolvePhotoMediaAccess(photoId, variant as MediaVariant, viewer);
  }

  if (!access) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!isSupabaseStorageConfigured()) {
    return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  }

  let buffer: Buffer;
  try {
    buffer = await downloadFile(access.bucket, access.path);
  } catch (error) {
    console.error("[api/media] download failed:", photoId, access.bucket, access.path, error);
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  // Nuevas subidas: ya tienen marca en Storage → servir directo (rápido).
  if (access.watermarkBakedIn) {
    return mediaResponse(buffer, true);
  }

  // Fotos viejas: aplicar marca SÍ O SÍ. Si falla, error (nunca imagen limpia).
  try {
    const quality = variant === "thumbnail" ? THUMBNAIL_QUALITY : PREVIEW_QUALITY;
    const watermarked = await applyServedPhotoWatermark(buffer, quality);

    void backfillWatermarkedVariant({
      photoId: access.photoId,
      bucket: access.bucket,
      path: access.path,
      buffer: watermarked,
    });

    return mediaResponse(watermarked, true);
  } catch (error) {
    console.error("[api/media] watermark failed (refusing clean image):", photoId, error);
    return NextResponse.json(
      { error: "No se pudo aplicar la marca de agua" },
      { status: 500 },
    );
  }
}
