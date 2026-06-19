/**
 * Modelo de negocio — etapa inicial de la startup.
 * Sin comisión de plataforma; cada fotógrafo cobra y entrega directamente.
 */
export const businessConfig = {
  /** Porcentaje que retiene EstuveAhí por venta (0 = el fotógrafo recibe el 100 %) */
  platformCommissionPercent: 0,
  /** La plataforma no envía archivos HD; lo hace cada fotógrafo */
  manualDeliveryByPhotographer: true,
  deliveryDescription:
    "Cada fotógrafo coordina el pago con el cliente y envía la imagen en alta resolución por el medio que acuerden (email, WhatsApp, etc.).",
  noPlatformFeeMessage:
    "En esta etapa EstuveAhí no cobra comisión: el 100 % de la venta es para el fotógrafo.",
} as const;

export function photographerNetAmount(quotedPriceCents: number): number {
  const fee =
    quotedPriceCents * (businessConfig.platformCommissionPercent / 100);
  return quotedPriceCents - fee;
}
