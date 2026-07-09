import { businessConfig } from "@/config/business";
import type { EventDoc } from "@/infrastructure/firebase/documents";
import { EventStatus } from "@/domain/enums/event-status";
import { toDate } from "@/infrastructure/firebase/helpers";

export type ListingExpiryStatus = "active" | "warning" | "expired";

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function resolveEventListingDates(
  data: Pick<EventDoc, "status" | "publishedAt" | "listingExpiresAt" | "updatedAt">,
): { publishedAt: Date | null; listingExpiresAt: Date | null } {
  if (data.status !== EventStatus.PUBLISHED) {
    return { publishedAt: null, listingExpiresAt: null };
  }

  const publishedAt = data.publishedAt ? toDate(data.publishedAt) : toDate(data.updatedAt);
  const listingExpiresAt = data.listingExpiresAt
    ? toDate(data.listingExpiresAt)
    : addDays(publishedAt, businessConfig.eventListingDays);

  return { publishedAt, listingExpiresAt };
}

export function isEventListingActive(
  data: Pick<EventDoc, "status" | "publishedAt" | "listingExpiresAt" | "updatedAt">,
): boolean {
  if (data.status !== EventStatus.PUBLISHED) return false;
  const { listingExpiresAt } = resolveEventListingDates(data);
  return isListingCurrentlyActive(listingExpiresAt);
}

export function isListingCurrentlyActive(listingExpiresAt: Date | null): boolean {
  return listingExpiresAt !== null && listingExpiresAt.getTime() > Date.now();
}

export function getListingDaysRemaining(listingExpiresAt: Date): number {
  return Math.max(
    0,
    Math.ceil((listingExpiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
  );
}

export function getListingExpiryStatus(listingExpiresAt: Date): ListingExpiryStatus {
  if (listingExpiresAt.getTime() <= Date.now()) return "expired";
  if (getListingDaysRemaining(listingExpiresAt) <= businessConfig.eventListingWarningDays) {
    return "warning";
  }
  return "active";
}

export function formatListingExpiryDate(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const EVENT_LISTING_NOTICE =
  `Cada evento permanece en cartelera ${businessConfig.eventListingDays} días desde su publicación. Después se oculta del catálogo y conviene eliminarlo para liberar espacio.`;
