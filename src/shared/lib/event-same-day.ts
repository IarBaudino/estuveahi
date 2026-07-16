/** Zona horaria operativa de EstuveAhí. */
export const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires";

/** Fecha calendario YYYY-MM-DD en Argentina (hoy). */
export function getArgentinaTodayString(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Ayer en calendario Argentina (YYYY-MM-DD). */
export function getArgentinaYesterdayString(now = new Date()): string {
  const today = getArgentinaTodayString(now);
  const [year, month, day] = today.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() - 1);
  return utc.toISOString().slice(0, 10);
}

/**
 * Día del evento tal como lo guarda el formulario (YYYY-MM-DD / ISO date).
 * Coincide con el slice que usan los formularios de edición.
 */
export function toEventCalendarDateString(value: string | Date): string {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function isEventDateToday(value: string | Date, now = new Date()): boolean {
  return toEventCalendarDateString(value) === getArgentinaTodayString(now);
}

/** Ventana permitida: cobertura de hoy o de ayer (para anunciar mientras se editan fotos). */
export function isEventDateTodayOrYesterday(
  value: string | Date,
  now = new Date(),
): boolean {
  const date = toEventCalendarDateString(value);
  return (
    date === getArgentinaTodayString(now) || date === getArgentinaYesterdayString(now)
  );
}

export const EVENT_SAME_DAY_RULE =
  "Los eventos se crean con fecha de hoy o de ayer (día de la cobertura). No se pueden cargar con fecha futura ni de hace más de un día.";

export const EVENT_SAME_DAY_PUBLISH_EMPTY =
  "Para anunciar una galería sin fotos (aviso en la home), la fecha del evento tiene que ser hoy o ayer.";

export const EVENT_COMING_SOON_HINT =
  "Si cubriste un evento hoy o ayer —o lo estás editando— crealo aunque todavía no tengas fotos. Al publicarlo, el público ve en la home que la galería llega pronto. Cuando subas la primera imagen, el aviso se reemplaza por la galería.";
