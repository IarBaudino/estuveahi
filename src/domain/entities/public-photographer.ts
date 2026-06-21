export interface PublicPhotographer {
  id: string;
  displayName: string;
  bio: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  isVerified: boolean;
  publishedEventCount: number;
  /** true si el perfil tiene avatar en Firestore */
  hasAvatar: boolean;
}
