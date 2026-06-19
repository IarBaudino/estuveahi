/**
 * Genera un patrón SVG de marca de agua repetido en diagonal.
 * Incluye identificador corto para rastreo forense básico.
 */
export function createWatermarkSvg(
  width: number,
  height: number,
  label: string,
): Buffer {
  const safeLabel = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const tileW = 320;
  const tileH = 180;
  const cols = Math.ceil(width / tileW) + 2;
  const rows = Math.ceil(height / tileH) + 2;

  const tiles: string[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * tileW - tileW / 2;
      const y = row * tileH + tileH / 2;
      tiles.push(`
        <text
          x="${x}" y="${y}"
          transform="rotate(-32 ${x} ${y})"
          font-family="Arial, Helvetica, sans-serif"
          font-size="15"
          font-weight="600"
          fill="rgba(255,255,255,0.38)"
          letter-spacing="2"
        >${safeLabel}</text>
      `);
    }
  }

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="transparent"/>
    ${tiles.join("")}
  </svg>`;

  return Buffer.from(svg);
}

export function shortPhotoLabel(photoId: string): string {
  return `ESTUVEAHÍ · ${photoId.slice(0, 8).toUpperCase()}`;
}
