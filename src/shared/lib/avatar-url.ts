/** URL pública del avatar servido por la app (no depende del bucket público de Supabase). */
export function getAvatarMediaUrl(userId: string): string {
  return `/api/avatar/${userId}`;
}

export function hasAvatar(profileAvatarUrl: string | null | undefined): boolean {
  return Boolean(profileAvatarUrl?.trim());
}
