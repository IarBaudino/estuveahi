import { FieldValue } from "firebase-admin/firestore";
import { getDb, getDbIfConfigured, getFirebaseAuth } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { PhotographerProfileDoc, ProfileDoc } from "@/infrastructure/firebase/documents";
import type { RegisterInput } from "../application/schemas/auth.schema";
import type { PhotographerOnboardingInput } from "../application/schemas/auth.schema";
import { Role, type UserRole } from "@/domain/enums/roles";
import { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";
import { toDate } from "@/infrastructure/firebase/helpers";
import type {
  PhotographerApplicationForAdmin,
  PhotographerProfile,
} from "@/domain/entities/user";

function mapPhotographerProfile(id: string, data: PhotographerProfileDoc): PhotographerProfile {
  return {
    id,
    displayName: data.displayName,
    bio: data.bio,
    websiteUrl: data.websiteUrl,
    instagramHandle: data.instagramHandle,
    portfolioUrl: data.portfolioUrl,
    isVerified: data.isVerified,
    applicationStatus: data.applicationStatus ?? null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

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

export async function submitPhotographerApplication(
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
    applicationStatus: PhotographerApplicationStatus.PENDING,
    createdAt: FieldValue.serverTimestamp() as unknown as Date,
    updatedAt: FieldValue.serverTimestamp() as unknown as Date,
  };

  await db
    .collection(COLLECTIONS.photographerProfiles)
    .doc(userId)
    .set(photographerData, { merge: true });
}

export async function getPhotographerApplicationStatus(
  userId: string,
): Promise<PhotographerApplicationStatus | null> {
  if (!userId?.trim()) return null;

  const db = getDbIfConfigured();
  if (!db) return null;

  const doc = await db.collection(COLLECTIONS.photographerProfiles).doc(userId).get();
  if (!doc.exists) return null;

  const data = doc.data() as PhotographerProfileDoc;
  return data.applicationStatus ?? null;
}

export async function getPhotographerProfile(userId: string): Promise<PhotographerProfile | null> {
  const db = getDbIfConfigured();
  if (!db) return null;

  const doc = await db
    .collection(COLLECTIONS.photographerProfiles)
    .doc(userId)
    .get();

  if (!doc.exists) return null;
  return mapPhotographerProfile(doc.id, doc.data() as PhotographerProfileDoc);
}

export async function getPendingPhotographerApplicationsForAdmin(): Promise<
  PhotographerApplicationForAdmin[]
> {
  const db = getDbIfConfigured();
  if (!db) return [];

  const snap = await db
    .collection(COLLECTIONS.photographerProfiles)
    .where("applicationStatus", "==", PhotographerApplicationStatus.PENDING)
    .limit(50)
    .get();

  if (snap.empty) return [];

  const profileSnaps = await Promise.all(
    snap.docs.map((doc) => db.collection(COLLECTIONS.profiles).doc(doc.id).get()),
  );

  return snap.docs
    .map((doc, index) => {
      const photographer = doc.data() as PhotographerProfileDoc;
      const profileDoc = profileSnaps[index];
      if (!profileDoc.exists) return null;

      const profile = profileDoc.data() as ProfileDoc;
      return {
        userId: doc.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        displayName: photographer.displayName,
        bio: photographer.bio,
        websiteUrl: photographer.websiteUrl,
        instagramHandle: photographer.instagramHandle,
        applicationStatus: photographer.applicationStatus ?? PhotographerApplicationStatus.PENDING,
        submittedAt: toDate(photographer.updatedAt),
      };
    })
    .filter((item): item is PhotographerApplicationForAdmin => item !== null);
}

export async function approvePhotographerApplication(userId: string): Promise<void> {
  const db = getDb();
  const profileRef = db.collection(COLLECTIONS.profiles).doc(userId);
  const photographerRef = db.collection(COLLECTIONS.photographerProfiles).doc(userId);

  const photographerDoc = await photographerRef.get();
  if (!photographerDoc.exists) {
    throw new Error("No hay solicitud de fotógrafo para este usuario");
  }

  const data = photographerDoc.data() as PhotographerProfileDoc;
  if (data.applicationStatus !== PhotographerApplicationStatus.PENDING) {
    throw new Error("La solicitud no está pendiente");
  }

  await photographerRef.update({
    applicationStatus: PhotographerApplicationStatus.APPROVED,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await profileRef.update({
    role: Role.PHOTOGRAPHER,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function rejectPhotographerApplication(userId: string): Promise<void> {
  const db = getDb();
  const photographerRef = db.collection(COLLECTIONS.photographerProfiles).doc(userId);
  const photographerDoc = await photographerRef.get();

  if (!photographerDoc.exists) {
    throw new Error("No hay solicitud de fotógrafo para este usuario");
  }

  const data = photographerDoc.data() as PhotographerProfileDoc;
  if (data.applicationStatus !== PhotographerApplicationStatus.PENDING) {
    throw new Error("La solicitud no está pendiente");
  }

  await photographerRef.update({
    applicationStatus: PhotographerApplicationStatus.REJECTED,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/** @deprecated Use submitPhotographerApplication */
export async function becomePhotographer(
  userId: string,
  input: PhotographerOnboardingInput,
) {
  await submitPhotographerApplication(userId, input);
}

export async function updateUserRole(userId: string, role: UserRole) {
  const db = getDb();
  await db.collection(COLLECTIONS.profiles).doc(userId).update({
    role,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (role === Role.PHOTOGRAPHER) {
    const photographerRef = db.collection(COLLECTIONS.photographerProfiles).doc(userId);
    const doc = await photographerRef.get();
    if (doc.exists) {
      await photographerRef.update({
        applicationStatus: PhotographerApplicationStatus.APPROVED,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
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
