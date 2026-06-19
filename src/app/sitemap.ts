import type { MetadataRoute } from "next";
import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { EventDoc } from "@/infrastructure/firebase/documents";
import { EventStatus } from "@/domain/enums/event-status";
import { toDate } from "@/infrastructure/firebase/helpers";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/eventos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const db = getDbIfConfigured();
    if (!db) return staticRoutes;

    const snap = await db
      .collection(COLLECTIONS.events)
      .where("status", "==", EventStatus.PUBLISHED)
      .where("isPublic", "==", true)
      .limit(1000)
      .get();

    const eventRoutes: MetadataRoute.Sitemap = snap.docs.map((doc) => {
      const data = doc.data() as EventDoc;
      return {
        url: `${base}/eventos/${data.slug}`,
        lastModified: toDate(data.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...eventRoutes];
  } catch {
    return staticRoutes;
  }
}
