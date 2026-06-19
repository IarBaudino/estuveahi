import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { assertFirebaseConfigured, isFirebaseConfigured } from "./config";

let app: App | null = null;

function normalizePrivateKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.includes("\\n")) {
    return trimmed.replace(/\\n/g, "\n");
  }
  return trimmed;
}

function initApp(): App {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  assertFirebaseConfigured();

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY!),
    }),
  });

  return app;
}

export function getFirebaseApp(): App | null {
  if (!isFirebaseConfigured()) return null;
  return initApp();
}

export function getDb(): Firestore {
  return getFirestore(initApp());
}

export function getDbIfConfigured(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  try {
    return getFirestore(initApp());
  } catch (error) {
    console.error("[firebase] No se pudo inicializar Firestore:", error);
    return null;
  }
}

export function getFirebaseAuth(): Auth {
  return getAuth(initApp());
}
