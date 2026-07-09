import { businessConfig } from "@/config/business";
import { cn } from "@/shared/lib/utils";
import {
  formatListingExpiryDate,
  getListingDaysRemaining,
  getListingExpiryStatus,
} from "@/shared/lib/event-listing";

interface EventListingNoticeProps {
  listingExpiresAt: Date | null;
  className?: string;
  compact?: boolean;
}

export function EventListingNotice({
  listingExpiresAt,
  className,
  compact = false,
}: EventListingNoticeProps) {
  if (!listingExpiresAt) return null;

  const status = getListingExpiryStatus(listingExpiresAt);
  const daysRemaining = getListingDaysRemaining(listingExpiresAt);

  if (status === "expired") {
    return (
      <p
        className={cn(
          "rounded-lg border border-red-500/30 bg-red-500/10 text-red-200",
          compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm",
          className,
        )}
      >
        Este evento salió de cartelera el {formatListingExpiryDate(listingExpiresAt)}.
        Eliminalo para liberar espacio en la plataforma.
      </p>
    );
  }

  return (
    <p
      className={cn(
        "rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-100/90",
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm",
        className,
      )}
    >
      En cartelera hasta el {formatListingExpiryDate(listingExpiresAt)}
      {status === "warning" ? ` (quedan ${daysRemaining} días)` : null}.{" "}
      {compact
        ? `Máx. ${businessConfig.eventListingDays} días publicado.`
        : businessConfig.eventListingNotice}
    </p>
  );
}

interface EventListingBadgeProps {
  listingExpiresAt: Date | null;
}

export function EventListingBadge({ listingExpiresAt }: EventListingBadgeProps) {
  if (!listingExpiresAt) return null;

  const status = getListingExpiryStatus(listingExpiresAt);
  const daysRemaining = getListingDaysRemaining(listingExpiresAt);

  if (status === "expired") {
    return (
      <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">
        Fuera de cartelera
      </span>
    );
  }

  if (status === "warning") {
    return (
      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-200">
        Vence en {daysRemaining} d
      </span>
    );
  }

  return (
    <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-on-surface-variant">
      Cartelera: {daysRemaining} d
    </span>
  );
}
