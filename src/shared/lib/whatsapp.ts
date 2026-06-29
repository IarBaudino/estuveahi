/** Normaliza teléfonos argentinos para wa.me (solo dígitos, con código 54). */
export function normalizePhoneForWhatsApp(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length >= 12 && digits.startsWith("54")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    return `549${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("9")) {
    return `54${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("15")) {
    return `549${digits.slice(2)}`;
  }

  return digits.length >= 10 ? digits : null;
}

export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
