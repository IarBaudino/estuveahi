import type { UserRole } from "@/domain/enums/roles";
import type { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  phone: string | null;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotographerProfile {
  id: string;
  displayName: string;
  bio: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  portfolioUrl: string | null;
  isVerified: boolean;
  applicationStatus: PhotographerApplicationStatus | null;
  /** Provincias donde ofrece cobertura / trabajos. */
  coverageProvinces: string[];
  /** Si quiere recibir consultas de contratación. */
  availableForHire: boolean;
  /** Si aparece en el directorio público de fotografxs. */
  isPublicProfile: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotographerApplicationForAdmin {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  displayName: string;
  bio: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  applicationStatus: PhotographerApplicationStatus;
  submittedAt: Date;
}
