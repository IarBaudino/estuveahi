import { NextResponse } from "next/server";
import { z } from "zod";
import { DomainError } from "@/domain/errors/domain-errors";
import { uploadPhotoSchema } from "@/features/photos/application/schemas/photo.schema";
import { assertPhotographerUploadAccess } from "@/features/photos/infrastructure/upload-auth";
import { uploadPhoto } from "@/features/photos/infrastructure/photo.repository";
import { toPhotoDTO } from "@/shared/lib/photo-serialization";

export const runtime = "nodejs";
export const maxDuration = 60;

const formSchema = uploadPhotoSchema.omit({ fileSize: true }).extend({
  priceCents: z.coerce.number().int().min(0).optional(),
});

function domainErrorStatus(error: DomainError): number {
  switch (error.code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "VALIDATION":
      return 400;
    default:
      return 400;
  }
}

export async function POST(request: Request) {
  try {
    const actor = await assertPhotographerUploadAccess();
    const formData = await request.formData();

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const parsed = formSchema.safeParse({
      eventId: formData.get("eventId"),
      filename: formData.get("filename") ?? file.name,
      mimeType: formData.get("mimeType") ?? file.type,
      priceCents: formData.get("priceCents") ?? undefined,
    });

    if (!parsed.success) {
      const detail = parsed.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ error: detail || "Datos inválidos" }, { status: 400 });
    }

    const input = {
      ...parsed.data,
      fileSize: file.size,
    };

    const sizeCheck = uploadPhotoSchema.shape.fileSize.safeParse(file.size);
    if (!sizeCheck.success) {
      return NextResponse.json(
        { error: sizeCheck.error.issues[0]?.message ?? "Archivo demasiado grande" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const photo = await uploadPhoto(actor.userId, input, buffer, actor.role);

    return NextResponse.json({ photo: toPhotoDTO(photo) });
  } catch (error) {
    console.error("[api/photos/upload]", error);

    if (error instanceof DomainError) {
      return NextResponse.json(
        { error: error.message },
        { status: domainErrorStatus(error) },
      );
    }

    const message =
      error instanceof Error ? error.message : "Error al subir la foto";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
