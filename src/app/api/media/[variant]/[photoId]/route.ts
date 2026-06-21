import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseStorageConfigured } from "@/infrastructure/supabase/config";
import { downloadFile } from "@/infrastructure/supabase/storage";
import { resolvePhotoMediaAccess } from "@/features/photos/infrastructure/media-access";
import type { MediaVariant } from "@/shared/lib/media-url";
import { siteConfig } from "@/config/site";
import { getServerSessionUser } from "@/infrastructure/auth/session";

export const runtime = "nodejs";

const VALID_VARIANTS = new Set<MediaVariant>(["thumbnail", "preview", "original"]);

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

  const user = await getServerSessionUser();
  const viewer = user ? { id: user.id, role: user.role } : undefined;

  const access = await resolvePhotoMediaAccess(
    photoId,
    variant as MediaVariant,
    viewer,
  );

  if (!access) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!isSupabaseStorageConfigured()) {
    return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  }

  try {
    const buffer = await downloadFile(access.bucket, access.path);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": access.contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
        "Referrer-Policy": "no-referrer",
        "X-Frame-Options": "DENY",
        "Permissions-Policy": "interest-cohort=()",
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
