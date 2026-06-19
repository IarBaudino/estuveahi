import { FieldValue } from "firebase-admin/firestore";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { Profile } from "@/domain/entities/user";
import type { UpdateProfileInput } from "../application/schemas/profile.schema";
import { ForbiddenError } from "@/domain/errors/domain-errors";
import { mapProfile } from "@/infrastructure/mappers/profile.mapper";
import type { ProfileDoc } from "@/infrastructure/firebase/documents";
import { STORAGE_BUCKETS } from "@/infrastructure/storage/storage.constants";
import { uploadFile, getPublicUrl } from "@/infrastructure/supabase/storage";

export async function getProfileById(userId: string): Promise<Profile | null> {
  const db = getDbIfConfigured();
  if (!db) return null;

  const doc = await db.collection(COLLECTIONS.profiles).doc(userId).get();
  if (!doc.exists) return null;
  return mapProfile(doc.id, doc.data() as ProfileDoc);
}

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const db = getDbIfConfigured();
  if (!db) return null;

  const snap = await db
    .collection(COLLECTIONS.profiles)
    .where("email", "==", email.toLowerCase().trim())
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return mapProfile(doc.id, doc.data() as ProfileDoc);
}

export async function isUserBlocked(userId: string): Promise<boolean> {
  const db = getDbIfConfigured();
  if (!db) return false;

  const doc = await db.collection(COLLECTIONS.profiles).doc(userId).get();
  if (!doc.exists) return false;
  return (doc.data() as ProfileDoc).isBlocked ?? false;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const db = getDb();
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`;

  await db.collection(COLLECTIONS.profiles).doc(userId).update({
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    fullName,
    phone: input.phone.trim(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await getProfileById(userId);
  if (!updated) throw new Error("Perfil no encontrado");
  return updated;
}

export async function uploadAvatar(
  userId: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/avatar.${ext}`;

  await uploadFile(STORAGE_BUCKETS.avatars, path, buffer, mimeType, "public, max-age=3600");
  const avatarUrl = `${getPublicUrl(STORAGE_BUCKETS.avatars, path)}?t=${Date.now()}`;

  const db = getDb();
  await db.collection(COLLECTIONS.profiles).doc(userId).update({
    avatarUrl,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return avatarUrl;
}

export async function setUserBlocked(userId: string, blocked: boolean) {
  const db = getDb();
  await db.collection(COLLECTIONS.profiles).doc(userId).update({
    isBlocked: blocked,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function assertUserNotBlocked(userId: string) {
  const blocked = await isUserBlocked(userId);
  if (blocked) {
    throw new ForbiddenError("Tu cuenta fue suspendida. Contactá al administrador.");
  }
}
