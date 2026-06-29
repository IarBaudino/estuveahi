import { siteConfig } from "@/config/site";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { formatCurrency } from "@/shared/lib/utils";

export function buildPurchaseRequestWhatsAppMessage(input: {
  clientFirstName?: string | null;
  eventTitle: string;
  photoSortOrder?: number;
  quotedPriceCents?: number | null;
  currency?: string;
  clientMessage?: string | null;
}): string {
  const firstName = input.clientFirstName?.trim();
  const greeting = firstName ? `Hola ${firstName}!` : "Hola!";
  const photoLabel =
    input.photoSortOrder != null
      ? `la foto ${formatPhotoNumber(input.photoSortOrder)} `
      : "tu foto ";
  const eventTitle = input.eventTitle.trim() || "el evento";

  const lines = [
    greeting,
    "",
    `Te escribo desde ${siteConfig.name} por tu pedido de ${photoLabel}del evento «${eventTitle}».`,
    "",
  ];

  if (input.quotedPriceCents != null && input.quotedPriceCents > 0) {
    lines.push(
      `El monto es ${formatCurrency(input.quotedPriceCents, input.currency ?? "ARS")}.`,
      "En un momento te paso los datos para el pago.",
      "",
    );
  } else {
    lines.push(
      "Te paso los datos para el pago y coordinamos la entrega de la imagen en alta calidad.",
      "",
    );
  }

  lines.push(
    "¿Por qué medio preferís recibirla: email o WhatsApp?",
    "",
    "¡Gracias!",
  );

  const clientMessage = input.clientMessage?.trim();
  if (clientMessage) {
    lines.push("", `Referencia de tu pedido: «${clientMessage}»`);
  }

  return lines.join("\n");
}
