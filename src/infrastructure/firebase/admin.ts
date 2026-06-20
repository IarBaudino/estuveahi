import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import {
  assertFirebaseConfigured,
  isFirebaseConfigured,
  resolveFirebaseCredentials,
} from "./config";

let app: App | null = null;

function initApp(): App {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  assertFirebaseConfigured();

  const credentials = resolveFirebaseCredentials();

  app = initializeApp({
    credential: cert({
      projectId: credentials.projectId,
      clientEmail: credentials.clientEmail,
      privateKey: credentials.privateKey,
    }),
  });

  return app;
}

export function getFirebaseApp(): App | null {
  if (!isFirebaseConfigured()) return null;
  try {
    return initApp();
  } catch (error) {
    console.error("[firebase] No se pudo inicializar la app:", error);
    return null;
  }
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
