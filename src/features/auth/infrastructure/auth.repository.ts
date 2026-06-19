import { FieldValue } from "firebase-admin/firestore";
import { getDb, getDbIfConfigured, getFirebaseAuth } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { PhotographerProfileDoc } from "@/infrastructure/firebase/documents";
import type { RegisterInput } from "../application/schemas/auth.schema";
import type { PhotographerOnboardingInput } from "../application/schemas/auth.schema";
import { Role, type UserRole } from "@/domain/enums/roles";

export async function registerUser(input: RegisterInput) {
  const auth = getFirebaseAuth();
  const db = getDb();
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`;

  const userRecord = await auth.createUser({
    email: input.email,
    password: input.password,
    displayName: fullName,
  });

  await db
    .collection(COLLECTIONS.profiles)
    .doc(userRecord.uid)
    .set({
      email: input.email,
      fullName,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      avatarUrl: null,
      role: Role.CLIENT,
      isBlocked: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return { id: userRecord.uid, email: userRecord.email };
}

export async function becomePhotographer(
  userId: string,
  input: PhotographerOnboardingInput,
) {
  const db = getDb();

  const photographerData: PhotographerProfileDoc = {
    displayName: input.displayName,
    bio: input.bio ?? null,
    websiteUrl: input.websiteUrl || null,
    instagramHandle: input.instagramHandle ?? null,
    portfolioUrl: null,
    isVerified: false,
    createdAt: FieldValue.serverTimestamp() as unknown as Date,
    updatedAt: FieldValue.serverTimestamp() as unknown as Date,
  };

  await db
    .collection(COLLECTIONS.photographerProfiles)
    .doc(userId)
    .set(photographerData);

  await db.collection(COLLECTIONS.profiles).doc(userId).update({
    role: Role.PHOTOGRAPHER,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getPhotographerProfile(userId: string) {
  const db = getDbIfConfigured();
  if (!db) return null;

  const doc = await db
    .collection(COLLECTIONS.photographerProfiles)
    .doc(userId)
    .get();

  if (!doc.exists) return null;
  const data = doc.data() as PhotographerProfileDoc;
  return {
    id: doc.id,
    displayName: data.displayName,
    bio: data.bio,
    websiteUrl: data.websiteUrl,
    instagramHandle: data.instagramHandle,
    portfolioUrl: data.portfolioUrl,
    isVerified: data.isVerified,
  };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const db = getDb();
  await db.collection(COLLECTIONS.profiles).doc(userId).update({
    role,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function verifyPhotographer(userId: string) {
  const db = getDb();
  await db.collection(COLLECTIONS.photographerProfiles).doc(userId).update({
    isVerified: true,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function unverifyPhotographer(userId: string) {
  const db = getDb();
  await db.collection(COLLECTIONS.photographerProfiles).doc(userId).update({
    isVerified: false,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function updatePhotographerProfile(
  userId: string,
  input: PhotographerOnboardingInput,
) {
  const db = getDb();
  await db.collection(COLLECTIONS.photographerProfiles).doc(userId).update({
    displayName: input.displayName,
    bio: input.bio ?? null,
    websiteUrl: input.websiteUrl || null,
    instagramHandle: input.instagramHandle ?? null,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
