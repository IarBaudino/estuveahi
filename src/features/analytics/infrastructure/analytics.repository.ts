import { FieldValue } from "firebase-admin/firestore";
import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import {
  classifyTrafficPath,
  encodePathDocId,
  formatTrafficPathLabel,
  orderedTrafficSections,
  TRAFFIC_SECTION_META,
  type TrafficSection,
} from "@/features/analytics/domain/traffic-sections";

const TOTALS_DOC = "totals";
const TIMEZONE = "America/Argentina/Buenos_Aires";

export interface AnalyticsSummary {
  pageViewsToday: number;
  uniqueVisitorsToday: number;
  pageViewsWeek: number;
  uniqueVisitorsWeek: number;
  pageViewsTotal: number;
}

export interface AnalyticsDailyRow {
  dateKey: string;
  dayLabel: string;
  pageViews: number;
  uniqueVisitors: number;
}

export interface AnalyticsSectionRow {
  id: TrafficSection;
  label: string;
  description: string;
  today: number;
  week: number;
}

export interface AnalyticsTopPathRow {
  path: string;
  label: string;
  section: TrafficSection;
  views: number;
}

export interface AnalyticsReport extends AnalyticsSummary {
  pagesPerVisitorToday: number | null;
  pagesPerVisitorWeek: number | null;
  dailyLast7Days: AnalyticsDailyRow[];
  sections: AnalyticsSectionRow[];
  topPathsWeek: AnalyticsTopPathRow[];
}

type DailyDoc = {
  pageViews?: number;
  uniqueVisitors?: number;
  sections?: Partial<Record<TrafficSection, number>>;
};

function todayKey(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

function lastNDaysKeys(n: number): string[] {
  const keys: string[] = [];
  const cursor = new Date();
  for (let i = 0; i < n; i++) {
    keys.push(todayKey(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return keys;
}

function formatDayLabel(dateKey: string, indexFromToday: number): string {
  if (indexFromToday === 0) return "Hoy";
  if (indexFromToday === 1) return "Ayer";

  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;

  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TIMEZONE,
  }).format(new Date(year, month - 1, day));
}

function ratio(pageViews: number, visitors: number): number | null {
  if (visitors <= 0) return null;
  return Math.round((pageViews / visitors) * 10) / 10;
}

function readSectionCounts(data: DailyDoc | undefined): Record<TrafficSection, number> {
  const sections = data?.sections ?? {};
  return orderedTrafficSections().reduce(
    (acc, section) => {
      acc[section] = sections[section] ?? 0;
      return acc;
    },
    {} as Record<TrafficSection, number>,
  );
}

/** Rutas de panel interno — no cuentan como tráfico público. */
export function isPublicTrafficPath(pathname: string): boolean {
  if (!pathname || pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/fotografo")) return false;
  if (pathname.startsWith("/cliente")) return false;
  return true;
}

export async function recordPageView(
  pathname: string,
  visitorId: string,
): Promise<void> {
  if (!isPublicTrafficPath(pathname)) return;

  const db = getDbIfConfigured();
  if (!db) return;

  const day = todayKey();
  const section = classifyTrafficPath(pathname);
  const dailyRef = db.collection(COLLECTIONS.analytics).doc("days").collection("items").doc(day);
  const totalsRef = db.collection(COLLECTIONS.analytics).doc(TOTALS_DOC);
  const visitorRef = dailyRef.collection("visitors").doc(visitorId);
  const pathRef = dailyRef.collection("paths").doc(encodePathDocId(pathname));

  const visitorSnap = await visitorRef.get();
  const isNewToday = !visitorSnap.exists;

  const batch = db.batch();
  batch.set(
    dailyRef,
    {
      pageViews: FieldValue.increment(1),
      [`sections.${section}`]: FieldValue.increment(1),
      ...(isNewToday ? { uniqueVisitors: FieldValue.increment(1) } : {}),
      date: day,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  batch.set(totalsRef, { pageViews: FieldValue.increment(1) }, { merge: true });
  batch.set(
    pathRef,
    {
      path: pathname,
      section,
      pageViews: FieldValue.increment(1),
      label: formatTrafficPathLabel(pathname),
    },
    { merge: true },
  );

  if (isNewToday) {
    batch.set(visitorRef, { firstSeenAt: FieldValue.serverTimestamp() });
  }

  await batch.commit();
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const report = await getAnalyticsReport();
  return {
    pageViewsToday: report.pageViewsToday,
    uniqueVisitorsToday: report.uniqueVisitorsToday,
    pageViewsWeek: report.pageViewsWeek,
    uniqueVisitorsWeek: report.uniqueVisitorsWeek,
    pageViewsTotal: report.pageViewsTotal,
  };
}

async function getTopPathsForDays(dayKeys: string[]): Promise<AnalyticsTopPathRow[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  const counts = new Map<string, AnalyticsTopPathRow>();

  await Promise.all(
    dayKeys.map(async (dayKey) => {
      const snap = await db
        .collection(COLLECTIONS.analytics)
        .doc("days")
        .collection("items")
        .doc(dayKey)
        .collection("paths")
        .get();

      for (const doc of snap.docs) {
        const data = doc.data() as {
          path?: string;
          section?: TrafficSection;
          pageViews?: number;
          label?: string;
        };
        const path = data.path ?? doc.id;
        const existing = counts.get(path);
        const views = data.pageViews ?? 0;

        counts.set(path, {
          path,
          label: data.label ?? formatTrafficPathLabel(path),
          section: data.section ?? classifyTrafficPath(path),
          views: (existing?.views ?? 0) + views,
        });
      }
    }),
  );

  return [...counts.values()].sort((a, b) => b.views - a.views).slice(0, 10);
}

export async function getAnalyticsReport(): Promise<AnalyticsReport> {
  const empty: AnalyticsReport = {
    pageViewsToday: 0,
    uniqueVisitorsToday: 0,
    pageViewsWeek: 0,
    uniqueVisitorsWeek: 0,
    pageViewsTotal: 0,
    pagesPerVisitorToday: null,
    pagesPerVisitorWeek: null,
    dailyLast7Days: [],
    sections: orderedTrafficSections().map((id) => ({
      id,
      ...TRAFFIC_SECTION_META[id],
      today: 0,
      week: 0,
    })),
    topPathsWeek: [],
  };

  const db = getDbIfConfigured();
  if (!db) return empty;

  const dayKeys = lastNDaysKeys(7);

  try {
    const [totalsSnap, ...dailySnaps] = await Promise.all([
      db.collection(COLLECTIONS.analytics).doc(TOTALS_DOC).get(),
      ...dayKeys.map((key) =>
        db.collection(COLLECTIONS.analytics).doc("days").collection("items").doc(key).get(),
      ),
    ]);

    const totalsData = totalsSnap.data() as { pageViews?: number } | undefined;
    const todayData = dailySnaps[0]?.data() as DailyDoc | undefined;

    let pageViewsWeek = 0;
    let uniqueVisitorsWeek = 0;
    const weekSectionTotals = orderedTrafficSections().reduce(
      (acc, section) => {
        acc[section] = 0;
        return acc;
      },
      {} as Record<TrafficSection, number>,
    );

    const dailyLast7Days: AnalyticsDailyRow[] = dayKeys.map((dateKey, index) => {
      const snap = dailySnaps[index];
      const data = snap?.exists ? (snap.data() as DailyDoc) : undefined;
      const pageViews = data?.pageViews ?? 0;
      const uniqueVisitors = data?.uniqueVisitors ?? 0;

      pageViewsWeek += pageViews;
      uniqueVisitorsWeek += uniqueVisitors;

      const sectionCounts = readSectionCounts(data);
      for (const section of orderedTrafficSections()) {
        weekSectionTotals[section] += sectionCounts[section];
      }

      return {
        dateKey,
        dayLabel: formatDayLabel(dateKey, index),
        pageViews,
        uniqueVisitors,
      };
    });

    const todaySections = readSectionCounts(todayData);
    const sections: AnalyticsSectionRow[] = orderedTrafficSections().map((id) => ({
      id,
      ...TRAFFIC_SECTION_META[id],
      today: todaySections[id],
      week: weekSectionTotals[id],
    }));

    const topPathsWeek = await getTopPathsForDays(dayKeys);

    const pageViewsToday = todayData?.pageViews ?? 0;
    const uniqueVisitorsToday = todayData?.uniqueVisitors ?? 0;

    return {
      pageViewsToday,
      uniqueVisitorsToday,
      pageViewsWeek,
      uniqueVisitorsWeek,
      pageViewsTotal: totalsData?.pageViews ?? 0,
      pagesPerVisitorToday: ratio(pageViewsToday, uniqueVisitorsToday),
      pagesPerVisitorWeek: ratio(pageViewsWeek, uniqueVisitorsWeek),
      dailyLast7Days,
      sections: sections.filter((row) => row.today > 0 || row.week > 0),
      topPathsWeek,
    };
  } catch (error) {
    console.error("[getAnalyticsReport]", error);
    return empty;
  }
}
