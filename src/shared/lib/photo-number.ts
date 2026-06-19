/** Número visible de la foto dentro del evento (1-based). */
export function formatPhotoNumber(sortOrder: number): string {
  return `#${sortOrder + 1}`;
}

export function formatPhotoLabel(sortOrder: number, eventTitle?: string): string {
  const num = formatPhotoNumber(sortOrder);
  return eventTitle ? `Foto ${num} · ${eventTitle}` : `Foto ${num}`;
}
