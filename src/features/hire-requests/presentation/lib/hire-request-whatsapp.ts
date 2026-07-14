import { siteConfig } from "@/config/site";
import { ARGENTINA_PROVINCE_LABELS } from "@/domain/enums/argentina-province";
import type { HireRequest } from "@/domain/entities/hire-request";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

export function buildHireLeadClientWhatsAppMessage(input: {
  requesterName: string;
  eventType: string;
  province: HireRequest["province"];
  city?: string | null;
  photographerDisplayName?: string | null;
}): string {
  const name = input.requesterName.trim() || "hola";
  const location = [
    input.city,
    ARGENTINA_PROVINCE_LABELS[input.province],
  ]
    .filter(Boolean)
    .join(", ");

  const lines = [
    `Hola ${name}!`,
    "",
    `Te escribo desde ${siteConfig.name} por tu consulta para contratar cobertura fotográfica.`,
    `Evento: ${input.eventType}`,
    location ? `Lugar: ${location}` : null,
    "",
    input.photographerDisplayName
      ? `Soy ${input.photographerDisplayName}. ¿Seguimos conversando por acá?`
      : "¿Seguimos conversando por acá?",
    "",
    "¡Gracias!",
  ].filter((line): line is string => line !== null);

  return lines.join("\n");
}

export function buildAdminToPhotographerHireWhatsAppMessage(input: {
  photographerDisplayName?: string | null;
  eventType: string;
  province: HireRequest["province"];
  city?: string | null;
}): string {
  const greeting = input.photographerDisplayName?.trim()
    ? `Hola ${input.photographerDisplayName.trim()}!`
    : "Hola!";
  const location = [
    input.city,
    ARGENTINA_PROVINCE_LABELS[input.province],
  ]
    .filter(Boolean)
    .join(", ");

  return [
    greeting,
    "",
    `Hay una consulta de contratación en ${siteConfig.name} que puede interesarte.`,
    `Evento: ${input.eventType}`,
    location ? `Zona: ${location}` : null,
    "",
    `Te la dejé en tu panel de solicitudes (${PHOTOGRAPHER_LABEL.panel}). Desde ahí podés escribirle por WhatsApp al interesado.`,
    "",
    "¡Gracias!",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
