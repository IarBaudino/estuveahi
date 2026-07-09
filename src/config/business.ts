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
    "La fotografx te contacta para coordinar el pago y enviarte la foto en alta.",
  photographerDeliveryNote:
    "Vos guardás el material en alta y lo enviás al cliente. En la web solo hay vistas previa con marca de agua.",
  /** Días en cartelera pública desde la publicación */
  eventListingDays: 30,
  /** Días antes del vencimiento para alertar al admin */
  eventListingWarningDays: 7,
  eventListingNotice:
    "Los eventos publicados permanecen en cartelera 30 días. Después se ocultan del catálogo y deben eliminarse para liberar espacio.",
  noPlatformFeeMessage:
    "En esta etapa EstuveAhí no cobra comisión: el 100 % de la venta es para el fotógrafo.",
} as const;

export function photographerNetAmount(quotedPriceCents: number): number {
  const fee =
    quotedPriceCents * (businessConfig.platformCommissionPercent / 100);
  return quotedPriceCents - fee;
}
