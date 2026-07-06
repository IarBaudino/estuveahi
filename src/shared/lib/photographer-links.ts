export function normalizeInstagramUrl(handle: string): string {
  const trimmed = handle.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const username = trimmed.replace(/^@/, "");
  return `https://instagram.com/${username}`;
}

export function formatInstagramLabel(handle: string): string {
  const trimmed = handle.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}
