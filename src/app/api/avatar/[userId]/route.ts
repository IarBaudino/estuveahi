import { NextResponse, type NextRequest } from "next/server";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import { isSupabaseStorageConfigured } from "@/infrastructure/supabase/config";
import { downloadFile } from "@/infrastructure/supabase/storage";
import { STORAGE_BUCKETS } from "@/infrastructure/storage/storage.constants";

const AVATAR_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

function parseSupabasePublicPath(
  avatarUrl: string,
): { bucket: string; path: string } | null {
  try {
    const url = new URL(avatarUrl);
    const marker = "/storage/v1/object/public/";
    const index = url.pathname.indexOf(marker);
    if (index === -1) return null;

    const rest = url.pathname.slice(index + marker.length);
    const slash = rest.indexOf("/");
    if (slash === -1) return null;

    return {
      bucket: rest.slice(0, slash),
      path: decodeURIComponent(rest.slice(slash + 1)),
    };
  } catch {
    return null;
  }
}

function contentTypeForPath(path: string): string {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function downloadAvatar(userId: string, storedUrl: string | null): Promise<Buffer | null> {
  if (!isSupabaseStorageConfigured()) return null;

  if (storedUrl) {
    const parsed = parseSupabasePublicPath(storedUrl);
    if (parsed) {
      try {
        return await downloadFile(parsed.bucket, parsed.path);
      } catch {
        // fallback a rutas conocidas
      }
    }
  }

  for (const ext of AVATAR_EXTENSIONS) {
    try {
      return await downloadFile(STORAGE_BUCKETS.avatars, `${userId}/avatar.${ext}`);
    } catch {
      // probar siguiente extensión
    }
  }

  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  if (!userId?.trim()) {
    return NextResponse.json({ error: "Usuario inválido" }, { status: 400 });
  }

  const profile = await getProfileById(userId);
  if (!profile?.avatarUrl?.trim()) {
    return NextResponse.json({ error: "Sin avatar" }, { status: 404 });
  }

  try {
    const buffer = await downloadAvatar(userId, profile.avatarUrl);
    if (!buffer) {
      return NextResponse.json({ error: "Avatar no encontrado" }, { status: 404 });
    }

    const parsed = parseSupabasePublicPath(profile.avatarUrl);
    const contentType = parsed
      ? contentTypeForPath(parsed.path)
      : "image/jpeg";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[api/avatar]", error);
    return NextResponse.json({ error: "No se pudo cargar el avatar" }, { status: 500 });
  }
}
