import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "./sharp";

const TILE_PATH = join(
  process.cwd(),
  "src/infrastructure/storage/assets/watermark-tile.png",
);

let tileBuffer: Buffer | null = null;

function getWatermarkTile(): Buffer {
  if (!tileBuffer) {
    tileBuffer = readFileSync(TILE_PATH);
  }
  return tileBuffer;
}

/**
 * Marca de agua en mosaico con texto ESTUVEAHI! (tile PNG pre-renderizado).
 * Evita SVG/fuentes del servidor que generaban cuadrados sin texto.
 */
export async function createWatermarkPng(width: number, height: number): Promise<Buffer> {
  const tile = getWatermarkTile();
  const tileMeta = await sharp(tile).metadata();
  const tileW = tileMeta.width ?? 720;
  const tileH = tileMeta.height ?? 280;

  const composites: { input: Buffer; left: number; top: number }[] = [];

  for (let top = 0; top < height; top += tileH) {
    for (let left = 0; left < width; left += tileW) {
      composites.push({ input: tile, left, top });
    }
  }

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 0.07 },
          },
        })
          .png()
          .toBuffer(),
        left: 0,
        top: 0,
      },
      ...composites,
    ])
    .png()
    .toBuffer();
}
