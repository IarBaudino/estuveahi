/**
 * Marca de agua en mosaico que cubre toda la imagen.
 */
export function createWatermarkSvg(width: number, height: number): Buffer {
  const patternWidth = Math.max(280, Math.round(width * 0.52));
  const patternHeight = Math.max(120, Math.round(patternWidth * 0.38));
  const fontSize = Math.max(30, Math.round(patternWidth / 6.2));
  const strokeWidth = Math.max(1.2, fontSize / 28);
  const centerFontSize = Math.max(42, Math.round(Math.min(width, height) / 3.8));
  const cx = width / 2;
  const cy = height / 2;
  const angle = -28;

  const textStyle = [
    `font-family="Arial Black, Arial, Helvetica, sans-serif"`,
    `font-size="${fontSize}"`,
    `font-weight="900"`,
    `fill="rgba(255,255,255,0.34)"`,
    `stroke="rgba(0,0,0,0.32)"`,
    `stroke-width="${strokeWidth}"`,
    `paint-order="stroke fill"`,
    `letter-spacing="1"`,
  ].join(" ");

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern
        id="estuveahi-pattern"
        width="${patternWidth}"
        height="${patternHeight}"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(${angle})"
      >
        <text x="8" y="${Math.round(fontSize * 0.95)}" ${textStyle}>ESTUVEAHI!</text>
        <text x="${Math.round(patternWidth * 0.48)}" y="${Math.round(patternHeight * 0.82)}" ${textStyle}>ESTUVEAHI!</text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#estuveahi-pattern)" />
    <g transform="rotate(${angle} ${cx} ${cy})">
      <text
        x="${cx}"
        y="${cy}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial Black, Arial, Helvetica, sans-serif"
        font-size="${centerFontSize}"
        font-weight="900"
        fill="rgba(255,255,255,0.22)"
        stroke="rgba(0,0,0,0.28)"
        stroke-width="${Math.max(1.5, centerFontSize / 24)}"
        paint-order="stroke fill"
        letter-spacing="2"
      >ESTUVEAHI!</text>
    </g>
  </svg>`;

  return Buffer.from(svg);
}
