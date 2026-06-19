import type { UserRole } from "@/domain/enums/roles";

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
  createdAt: Date;
  updatedAt: Date;
}
