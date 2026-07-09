import sharp from "./sharp";
import { WATERMARK_TILE_BASE64 } from "./watermark-tile-data";

const TILE_W = 720;
const TILE_H = 280;

let tileBuffer: Buffer | null = null;

function getWatermarkTile(): Buffer {
  if (!tileBuffer) {
    tileBuffer = Buffer.from(WATERMARK_TILE_BASE64, "base64");
  }
  return tileBuffer;
}

/**
 * Marca de agua en mosaico con texto ESTUVEAHI! (tile PNG embebido).
 * No lee archivos del disco: funciona igual en local y en Vercel.
 */
export async function createWatermarkPng(width: number, height: number): Promise<Buffer> {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const tile = getWatermarkTile();

  const shortSide = Math.min(safeWidth, safeHeight);
  const targetTileW = Math.max(160, Math.min(TILE_W, Math.round(shortSide * 0.9)));
  const scale = targetTileW / TILE_W;
  const scaledTileW = Math.max(1, Math.round(TILE_W * scale));
  const scaledTileH = Math.max(1, Math.round(TILE_H * scale));

  const scaledTile = await sharp(tile)
    .resize(scaledTileW, scaledTileH, { fit: "fill" })
    .png()
    .toBuffer();

  const composites: { input: Buffer; left: number; top: number }[] = [];
  for (let top = 0; top < safeHeight; top += scaledTileH) {
    for (let left = 0; left < safeWidth; left += scaledTileW) {
      composites.push({ input: scaledTile, left, top });
    }
  }

  return sharp({
    create: {
      width: safeWidth,
      height: safeHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0.08 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}
