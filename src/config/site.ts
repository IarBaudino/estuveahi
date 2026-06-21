function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return "https://estuveahi.com.ar";

  try {
    return new URL(raw).origin;
  } catch {
    return "https://estuveahi.com.ar";
  }
}

export const siteConfig = {
  name: "EstuveAhí",
  description:
    "Conectamos asistentes con fotógrafos de eventos. Sin comisión de plataforma: cada profesional cobra y entrega sus fotos directamente.",
  url: getAppUrl(),
  /** Dominio público del QR impreso (siempre estuveahi.com.ar) */
  publicUrl: "https://estuveahi.com.ar",
  ogImage: "/og/default.png",
} as const;

/** URL que codifica el único QR de la plataforma. */
export function getSiteQrUrl(): string {
  return siteConfig.publicUrl.replace(/\/$/, "");
}
