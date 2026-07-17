import { unstable_cache } from "next/cache";
import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import { EventStatus } from "@/domain/enums/event-status";
import { Role } from "@/domain/enums/roles";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { formatCompactStat } from "@/shared/lib/format-stat";

export interface PlatformPublicStats {
  photos: number;
  events: number;
  photographers: number;
  users: number;
}

export interface LandingStatItem {
  value: string;
  label: string;
}

async function fetchPlatformPublicStats(): Promise<PlatformPublicStats> {
  const db = getDbIfConfigured();
  if (!db) {
    return { photos: 0, events: 0, photographers: 0, users: 0 };
  }

  try {
    const [photos, events, photographers, users] = await Promise.all([
      db.collection(COLLECTIONS.photos).count().get(),
      db
        .collection(COLLECTIONS.events)
        .where("status", "==", EventStatus.PUBLISHED)
        .count()
        .get(),
      db.collection(COLLECTIONS.profiles).where("role", "==", Role.PHOTOGRAPHER).count().get(),
      db.collection(COLLECTIONS.profiles).count().get(),
    ]);

    return {
      photos: photos.data().count,
      events: events.data().count,
      photographers: photographers.data().count,
      users: users.data().count,
    };
  } catch (error) {
    console.error("[getPlatformPublicStats]", error);
    return { photos: 0, events: 0, photographers: 0, users: 0 };
  }
}

export const getPlatformPublicStats = unstable_cache(
  fetchPlatformPublicStats,
  ["platform-public-stats"],
  { revalidate: 120 },
);

export function mapPlatformStatsToLanding(stats: PlatformPublicStats): LandingStatItem[] {
  return [
    { value: formatCompactStat(stats.photos), label: "Fotos capturadas" },
    { value: formatCompactStat(stats.events), label: "Eventos publicados" },
    {
      value: formatCompactStat(stats.photographers),
      label: `${PHOTOGRAPHER_LABEL.pluralCap} pro`,
    },
    { value: formatCompactStat(stats.users), label: "Usuarios registrados" },
  ];
}
