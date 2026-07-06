function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return "https://www.estuveahi.com.ar";

  try {
    return new URL(raw).origin;
  } catch {
    return "https://www.estuveahi.com.ar";
  }
}

export const siteConfig = {
  name: "EstuveAhí",
  description:
    "Encontrá y comprá fotos de eventos en Argentina: recitales, festivales, teatro y deporte. Galerías de fotografxs profesionales sin comisión de plataforma.",
  url: getAppUrl(),
  /** Dominio público canónico (con www). */
  publicUrl: "https://www.estuveahi.com.ar",
  logo: "/logo.png",
  ogImage: "/og/default.png",
} as const;

/** URL que codifica el único QR de la plataforma. */
export function getSiteQrUrl(): string {
  return siteConfig.publicUrl.replace(/\/$/, "");
}
