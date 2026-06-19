/**
 * Promueve un usuario a admin por email.
 * Uso: node scripts/set-admin.mjs tu@email.com
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.error("No se encontró .env.local");
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error("Uso: node scripts/set-admin.mjs tu@email.com");
  process.exit(1);
}

loadEnv();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Faltan variables Firebase en .env.local");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const db = getFirestore();
const snap = await db
  .collection("profiles")
  .where("email", "==", email.toLowerCase().trim())
  .limit(1)
  .get();

if (snap.empty) {
  console.error(`No hay usuario con email ${email}. Registrate primero en la app.`);
  process.exit(1);
}

const doc = snap.docs[0];
await doc.ref.update({ role: "admin" });
console.log(`✓ ${email} ahora es admin (uid: ${doc.id})`);
