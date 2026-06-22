import { siteConfig } from "@/config/site";

/**
 * Marca de agua diagonal repetida en toda la imagen (miniatura y preview).
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

  const siteHost = new URL(siteConfig.publicUrl).host.replace(/&/g, "&amp;");
  const longest = Math.max(width, height);
  const fontSize = Math.max(11, Math.min(20, Math.round(longest / 24)));
  const tileW = Math.max(90, Math.round(width / 2.2));
  const tileH = Math.max(55, Math.round(height / 2.8));
  const cols = Math.ceil(width / tileW) + 3;
  const rows = Math.ceil(height / tileH) + 3;
  const centerFont = Math.max(28, Math.min(72, Math.round(longest / 7)));

  const tiles: string[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * tileW - tileW;
      const y = row * tileH + tileH / 2;
      const offset = row % 2 === 0 ? 0 : tileW / 2;
      tiles.push(`
        <text
          x="${x + offset}" y="${y}"
          transform="rotate(-34 ${x + offset} ${y})"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="700"
          fill="rgba(255,255,255,0.48)"
          letter-spacing="1.5"
        >${safeLabel}</text>
        <text
          x="${x + offset}" y="${y + fontSize + 4}"
          transform="rotate(-34 ${x + offset} ${y + fontSize + 4})"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${Math.max(8, fontSize - 3)}"
          font-weight="500"
          fill="rgba(255,255,255,0.32)"
          letter-spacing="1"
        >${siteHost}</text>
      `);
    }
  }

  const cx = width / 2;
  const cy = height / 2;

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="diag-stripes" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(-34)">
        <rect width="28" height="28" fill="transparent"/>
        <line x1="0" y1="0" x2="0" y2="28" stroke="rgba(255,255,255,0.14)" stroke-width="10"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diag-stripes)"/>
    <text
      x="${cx}" y="${cy}"
      text-anchor="middle"
      dominant-baseline="middle"
      transform="rotate(-34 ${cx} ${cy})"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${centerFont}"
      font-weight="800"
      fill="rgba(255,255,255,0.22)"
      letter-spacing="4"
    >ESTUVEAHÍ</text>
    ${tiles.join("")}
  </svg>`;

  return Buffer.from(svg);
}

export function shortPhotoLabel(photoId: string): string {
  return `ESTUVEAHÍ · ${photoId.slice(0, 8).toUpperCase()}`;
}
