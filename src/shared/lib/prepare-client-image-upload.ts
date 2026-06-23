import {
  isAllowedUploadImage,
  isHeicImage,
  UPLOAD_PREPARE_MAX_BYTES,
} from "@/shared/lib/image-upload";

const MAX_DIMENSION = 2560;

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });

  const blob = Array.isArray(result) ? result[0] : result;
  if (!(blob instanceof Blob)) {
    throw new Error("No se pudo convertir la foto del celular");
  }

  const baseName = file.name.replace(/\.(heic|heif)$/i, "") || "foto";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

async function compressImageFile(file: File, maxBytes: number): Promise<File> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    let { width, height } = image;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No se pudo procesar la imagen en este dispositivo");
    }

    ctx.drawImage(image, 0, 0, width, height);

    let quality = 0.88;
    let blob = await canvasToJpegBlob(canvas, quality);

    while (blob.size > maxBytes && quality > 0.45) {
      quality -= 0.08;
      blob = await canvasToJpegBlob(canvas, quality);
    }

    if (blob.size > maxBytes) {
      throw new Error(
        "La foto es muy pesada incluso después de comprimirla. Probá con otra imagen.",
      );
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo leer la imagen"));
    image.src = src;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo comprimir la imagen"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

/** Normaliza fotos de celular (HEIC, tipo vacío, archivos muy grandes) antes de subir. */
export async function prepareClientImageUpload(file: File): Promise<File> {
  if (!isAllowedUploadImage(file)) {
    throw new Error("Tipo no permitido. Usá JPG, PNG, WebP o la foto de tu cámara.");
  }

  let prepared = file;

  if (isHeicImage(file)) {
    prepared = await convertHeicToJpeg(file);
  }

  if (prepared.size > UPLOAD_PREPARE_MAX_BYTES) {
    prepared = await compressImageFile(prepared, UPLOAD_PREPARE_MAX_BYTES);
  }

  return prepared;
}
