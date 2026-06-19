import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { assertFirebaseConfigured, isFirebaseConfigured } from "./config";

let app: App | null = null;

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
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
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
  return getFirestore(initApp());
}

export function getFirebaseAuth(): Auth {
  return getAuth(initApp());
}
