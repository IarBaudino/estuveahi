import type { Timestamp } from "firebase-admin/firestore";

export function toDate(
  value: Timestamp | Date | string | null | undefined,
): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate();
  }
  return new Date();
}

export function buildSearchKeywords(
  title: string,
  description?: string | null,
  city?: string | null,
  venue?: string | null,
): string[] {
  const text = [title, description, city, venue]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  const words = text.split(/\s+/).filter((w) => w.length > 2);
  return [...new Set(words)];
}

export function matchesSearch(
  keywords: string[],
  query: string,
): boolean {
  const q = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = keywords.join(" ");
  return terms.every((term) => haystack.includes(term));
}
