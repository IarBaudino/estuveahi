import type { Profile } from "@/domain/entities/user";
import type { ProfileDoc } from "@/infrastructure/firebase/documents";
import { toDate } from "@/infrastructure/firebase/helpers";

export function mapProfile(id: string, data: ProfileDoc): Profile {
  return {
    id,
    email: data.email,
    fullName: data.fullName,
    firstName: data.firstName,
    lastName: data.lastName,
    avatarUrl: data.avatarUrl,
    role: data.role,
    phone: data.phone,
    isBlocked: data.isBlocked,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}
