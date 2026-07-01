/** Formato compacto para métricas de la home (ej. 1200 → "1.2k"). */
export function formatCompactStat(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0";

  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }

  if (value >= 1_000) {
    const thousands = value / 1_000;
    return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(1)}k`;
  }

  return String(Math.round(value));
}
