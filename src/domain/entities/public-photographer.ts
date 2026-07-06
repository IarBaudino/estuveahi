export interface PublicPhotographer {
  id: string;
  displayName: string;
  bio: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  portfolioUrl: string | null;
  isVerified: boolean;
  publishedEventCount: number;
  /** true si el perfil tiene avatar en Firestore */
  hasAvatar: boolean;
  phone: string | null;
  email: string | null;
  contactName: string | null;
}
