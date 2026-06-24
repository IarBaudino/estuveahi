import type { MetadataRoute } from "next";
import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { EventDoc } from "@/infrastructure/firebase/documents";
import { EventStatus } from "@/domain/enums/event-status";
import { toDate } from "@/infrastructure/firebase/helpers";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { legalContentBySlug } from "@/features/legal/content/documents";
import { Role } from "@/domain/enums/roles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}${routes.events}`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}${routes.photographers}`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}${routes.becomePhotographer}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}${routes.legal.hub}`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ...Object.keys(legalContentBySlug).map((slug) => ({
      url: `${base}${routes.legal.document(slug)}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];

  try {
    const db = getDbIfConfigured();
    if (!db) return staticRoutes;

    const [eventsSnap, photographersSnap] = await Promise.all([
      db
        .collection(COLLECTIONS.events)
        .where("status", "==", EventStatus.PUBLISHED)
        .where("isPublic", "==", true)
        .limit(1000)
        .get(),
      db
        .collection(COLLECTIONS.profiles)
        .where("role", "==", Role.PHOTOGRAPHER)
        .limit(500)
        .get(),
    ]);

    const eventRoutes: MetadataRoute.Sitemap = eventsSnap.docs.map((doc) => {
      const data = doc.data() as EventDoc;
      return {
        url: `${base}${routes.event(data.slug)}`,
        lastModified: toDate(data.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    const photographerRoutes: MetadataRoute.Sitemap = photographersSnap.docs.map((doc) => ({
      url: `${base}${routes.photographerPublic(doc.id)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    return [...staticRoutes, ...eventRoutes, ...photographerRoutes];
  } catch (error) {
    console.error("[sitemap]", error);
    return staticRoutes;
  }
}
