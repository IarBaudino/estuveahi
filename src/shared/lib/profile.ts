export interface ProfileContactFields {
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
}

export function getDisplayName(profile: ProfileContactFields): string {
  const parts = [profile.firstName, profile.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return profile.email;
}

export function isProfileComplete(profile: ProfileContactFields): boolean {
  return !!(
    profile.firstName?.trim() &&
    profile.lastName?.trim() &&
    profile.phone?.trim() &&
    profile.email?.trim()
  );
}
