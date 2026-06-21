import { NextResponse } from "next/server";
import { getDbIfConfigured, getLastFirebaseInitError } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import { EventStatus } from "@/domain/enums/event-status";
import { diagnoseFirebasePrivateKey, isFirebaseConfigured } from "@/infrastructure/firebase/config";

export const runtime = "nodejs";

function trimEnv(value: string | undefined | null): string | null {
  if (!value) return null;
  return value.trim() || null;
}

async function runFotografoDiagnostic() {
  const steps: Record<string, { ok: boolean; detail?: string }> = {};

  try {
    const { auth } = await import("@/infrastructure/auth");
    const session = await auth();
    steps.auth = {
      ok: Boolean(session?.user),
      detail: session?.user
        ? `role=${session.user.role}, id=${session.user.id ? "yes" : "missing"}`
        : "no session",
    };

    const userId = session?.user?.id?.trim();
    if (!userId) {
      return { ok: false, steps };
    }

    const { getProfileById } = await import(
      "@/features/profile/infrastructure/profile.repository"
    );
    const { getPhotographerApplicationStatus } = await import(
      "@/features/auth/infrastructure/auth.repository"
    );
    const { getPhotographerEvents } = await import(
      "@/features/events/infrastructure/event.repository"
    );
    const { getPendingRequestCount } = await import(
      "@/features/purchase-requests/infrastructure/purchase-request.repository"
    );
    const { getPhotographerPhotoCount } = await import(
      "@/features/photos/infrastructure/photo-read.repository"
    );

    try {
      const profile = await getProfileById(userId);
      steps.profile = {
        ok: Boolean(profile),
        detail: profile ? `role=${profile.role}` : "not found",
      };
    } catch (error) {
      steps.profile = {
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    try {
      const status = await getPhotographerApplicationStatus(userId);
      steps.application = { ok: true, detail: status ?? "none" };
    } catch (error) {
      steps.application = {
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    try {
      const [events, pending, photos] = await Promise.all([
        getPhotographerEvents(userId),
        getPendingRequestCount(userId),
        getPhotographerPhotoCount(userId),
      ]);
      steps.dashboard = {
        ok: true,
        detail: `events=${events.length}, pending=${pending}, photos=${photos}`,
      };
    } catch (error) {
      steps.dashboard = {
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    return { ok: Object.values(steps).every((step) => step.ok), steps };
  } catch (error) {
    return {
      ok: false,
      steps,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Diagnóstico rápido en Vercel — no expone secretos, solo si están definidos. */
export async function GET(request: Request) {
  const check = new URL(request.url).searchParams.get("check");

  const flags = {
    FIREBASE_PROJECT_ID: Boolean(process.env.FIREBASE_PROJECT_ID),
    FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
    FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
    FIREBASE_SERVICE_ACCOUNT_JSON: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
    NEXT_PUBLIC_FIREBASE_API_KEY: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
    NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
    NEXTAUTH_URL: trimEnv(process.env.NEXTAUTH_URL),
    NEXT_PUBLIC_APP_URL: trimEnv(process.env.NEXT_PUBLIC_APP_URL),
    VERCEL_URL: process.env.VERCEL_URL ?? null,
  };

  const required = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "NEXT_PUBLIC_APP_URL",
  ] as const;

  const missing = required.filter((key) => {
    if (key === "FIREBASE_PRIVATE_KEY" && flags.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return false;
    }
    return !flags[key as keyof typeof flags];
  });

  const privateKeyCheck = diagnoseFirebasePrivateKey();

  let firebase: { ok: boolean; error: string | null; publishedEvents: number | null } = {
    ok: false,
    error: null,
    publishedEvents: null,
  };

  if (!privateKeyCheck.ok) {
    firebase.error = privateKeyCheck.hint;
  } else if (!isFirebaseConfigured()) {
    firebase.error = "variables_missing";
  } else {
    try {
      const db = getDbIfConfigured();
      if (!db) {
        firebase.error =
          getLastFirebaseInitError() ??
          "No se pudo conectar a Firebase. Revisá FIREBASE_PRIVATE_KEY o usá FIREBASE_SERVICE_ACCOUNT_JSON.";
      } else {
        const snap = await db
          .collection(COLLECTIONS.events)
          .where("status", "==", EventStatus.PUBLISHED)
          .limit(5)
          .get();
        firebase = {
          ok: true,
          error: null,
          publishedEvents: snap.size,
        };
      }
    } catch (error) {
      firebase = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        publishedEvents: null,
      };
    }
  }

  const payload: Record<string, unknown> = {
    ok:
      missing.length === 0 &&
      (flags.AUTH_SECRET || flags.NEXTAUTH_SECRET) &&
      firebase.ok,
    missing,
    flags,
    privateKey: privateKeyCheck.ok ? { ok: true } : privateKeyCheck,
    firebase,
  };

  if (check === "fotografo") {
    payload.fotografo = await runFotografoDiagnostic();
  }

  if (check === "upload") {
    const steps: Record<string, { ok: boolean; detail?: string }> = {};

    try {
      const sharp = (await import("sharp")).default;
      const test = await sharp({
        create: { width: 8, height: 8, channels: 3, background: "#ffffff" },
      })
        .webp()
        .toBuffer();
      steps.sharp = { ok: test.length > 0, detail: `${test.length} bytes webp` };
    } catch (error) {
      steps.sharp = {
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    const { isSupabaseStorageConfigured } = await import("@/infrastructure/supabase/config");
    steps.supabase = {
      ok: isSupabaseStorageConfigured(),
      detail: isSupabaseStorageConfigured() ? "configured" : "missing env",
    };

    payload.upload = { ok: Object.values(steps).every((step) => step.ok), steps };
  }

  return NextResponse.json(payload);
}
