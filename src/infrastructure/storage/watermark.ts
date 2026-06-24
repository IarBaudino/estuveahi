import { siteConfig } from "@/config/site";

/**
 * Marca de agua diagonal grande que atraviesa toda la imagen.
 */
export function createWatermarkSvg(
  width: number,
  height: number,
  _label: string,
): Buffer {
  const siteHost = new URL(siteConfig.publicUrl).host.replace(/&/g, "&amp;");
  const diagonal = Math.hypot(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const angle = -32;

  const mainFontSize = Math.max(56, Math.round(diagonal / 4.2));
  const subFontSize = Math.max(14, Math.round(mainFontSize / 5));

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="wm-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.45)"/>
      </filter>
    </defs>
    <g transform="rotate(${angle} ${cx} ${cy})" filter="url(#wm-shadow)">
      <text
        x="${cx}"
        y="${cy - subFontSize * 0.35}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${mainFontSize}"
        font-weight="900"
        fill="rgba(255,255,255,0.42)"
        stroke="rgba(0,0,0,0.28)"
        stroke-width="${Math.max(1.5, mainFontSize / 40)}"
        paint-order="stroke fill"
        letter-spacing="${Math.round(mainFontSize / 14)}"
      >ESTUVEAHÍ</text>
      <text
        x="${cx}"
        y="${cy + mainFontSize * 0.42}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${subFontSize}"
        font-weight="700"
        fill="rgba(255,255,255,0.3)"
        stroke="rgba(0,0,0,0.2)"
        stroke-width="1"
        paint-order="stroke fill"
        letter-spacing="2"
      >${siteHost}</text>
    </g>
  </svg>`;

  return Buffer.from(svg);
}

export function shortPhotoLabel(photoId: string): string {
  return `ESTUVEAHÍ · ${photoId.slice(0, 8).toUpperCase()}`;
}
