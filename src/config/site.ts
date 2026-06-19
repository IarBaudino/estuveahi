export const siteConfig = {
  name: "EstuveAhí",
  description:
    "Conectamos asistentes con fotógrafos de eventos. Sin comisión de plataforma: cada profesional cobra y entrega sus fotos directamente.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://estuveahi.com.ar",
  /** Dominio público del QR impreso (siempre estuveahi.com.ar) */
  publicUrl: "https://estuveahi.com.ar",
  ogImage: "/og/default.png",
} as const;

/** URL que codifica el único QR de la plataforma. */
export function getSiteQrUrl(): string {
  return siteConfig.publicUrl.replace(/\/$/, "");
}
