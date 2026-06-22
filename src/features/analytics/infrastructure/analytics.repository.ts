import { FieldValue } from "firebase-admin/firestore";
import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";

const TOTALS_DOC = "totals";

export interface AnalyticsSummary {
  pageViewsToday: number;
  uniqueVisitorsToday: number;
  pageViewsWeek: number;
  uniqueVisitorsWeek: number;
  pageViewsTotal: number;
}

function todayKey(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
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
  const dailyRef = db.collection(COLLECTIONS.analytics).doc("days").collection("items").doc(day);
  const totalsRef = db.collection(COLLECTIONS.analytics).doc(TOTALS_DOC);
  const visitorRef = dailyRef.collection("visitors").doc(visitorId);

  const visitorSnap = await visitorRef.get();
  const isNewToday = !visitorSnap.exists;

  const batch = db.batch();
  batch.set(
    dailyRef,
    {
      pageViews: FieldValue.increment(1),
      ...(isNewToday ? { uniqueVisitors: FieldValue.increment(1) } : {}),
      date: day,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  batch.set(totalsRef, { pageViews: FieldValue.increment(1) }, { merge: true });

  if (isNewToday) {
    batch.set(visitorRef, { firstSeenAt: FieldValue.serverTimestamp() });
  }

  await batch.commit();
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const db = getDbIfConfigured();
  if (!db) {
    return {
      pageViewsToday: 0,
      uniqueVisitorsToday: 0,
      pageViewsWeek: 0,
      uniqueVisitorsWeek: 0,
      pageViewsTotal: 0,
    };
  }

  const dayKeys = lastNDaysKeys(7);
  const today = dayKeys[0]!;

  try {
    const [totalsSnap, ...dailySnaps] = await Promise.all([
      db.collection(COLLECTIONS.analytics).doc(TOTALS_DOC).get(),
      ...dayKeys.map((key) =>
        db.collection(COLLECTIONS.analytics).doc("days").collection("items").doc(key).get(),
      ),
    ]);

    const totalsData = totalsSnap.data() as { pageViews?: number } | undefined;
    const todayData = dailySnaps[0]?.data() as
      | { pageViews?: number; uniqueVisitors?: number }
      | undefined;

    let pageViewsWeek = 0;
    let uniqueVisitorsWeek = 0;

    for (const snap of dailySnaps) {
      if (!snap.exists) continue;
      const data = snap.data() as { pageViews?: number; uniqueVisitors?: number };
      pageViewsWeek += data.pageViews ?? 0;
      uniqueVisitorsWeek += data.uniqueVisitors ?? 0;
    }

    return {
      pageViewsToday: todayData?.pageViews ?? 0,
      uniqueVisitorsToday: todayData?.uniqueVisitors ?? 0,
      pageViewsWeek,
      uniqueVisitorsWeek,
      pageViewsTotal: totalsData?.pageViews ?? 0,
    };
  } catch (error) {
    console.error("[getAnalyticsSummary]", error);
    return {
      pageViewsToday: 0,
      uniqueVisitorsToday: 0,
      pageViewsWeek: 0,
      uniqueVisitorsWeek: 0,
      pageViewsTotal: 0,
    };
  }
}
