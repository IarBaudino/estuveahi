import { NextResponse } from "next/server";
import { getDbIfConfigured, getLastFirebaseInitError } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import { EventStatus } from "@/domain/enums/event-status";
import { diagnoseFirebasePrivateKey, isFirebaseConfigured } from "@/infrastructure/firebase/config";

/** Diagnóstico rápido en Vercel — no expone secretos, solo si están definidos. */
export async function GET() {
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
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? null,
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
    return !flags[key];
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

  return NextResponse.json({
    ok:
      missing.length === 0 &&
      (flags.AUTH_SECRET || flags.NEXTAUTH_SECRET) &&
      firebase.ok,
    missing,
    flags,
    privateKey: privateKeyCheck.ok ? { ok: true } : privateKeyCheck,
    firebase,
  });
}
