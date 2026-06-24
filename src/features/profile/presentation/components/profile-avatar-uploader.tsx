"use client";

import { useRef } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { uploadAvatarAction } from "@/features/profile/presentation/actions/profile.actions";
import { Button } from "@/shared/ui/button";
import { User } from "lucide-react";
import Image from "next/image";

interface ProfileAvatarUploaderProps {
  avatarUrl: string | null;
  /** Foto visible en el catálogo de fotografxs */
  variant?: "account" | "public";
}

export function ProfileAvatarUploader({
  avatarUrl,
  variant = "account",
}: ProfileAvatarUploaderProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { execute: uploadAvatar, isExecuting: uploading } = useAction(
    uploadAvatarAction,
    { onSuccess: () => router.refresh() },
  );

  const isPublic = variant === "public";

  async function handleAvatarChange(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
    if (file.size > 2 * 1024 * 1024) return;

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    uploadAvatar({
      mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
      fileBase64: base64,
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={isPublic ? "Foto pública" : "Avatar"}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <User className="h-8 w-8 text-zinc-400" />
        )}
      </button>
      <div>
        <p className="font-medium">{isPublic ? "Foto pública" : "Foto de perfil"}</p>
        <p className="text-sm text-zinc-500">
          {isPublic
            ? "Aparece en tu página del catálogo y en las tarjetas de fotografx"
            : "Opcional · JPG, PNG o WebP · Máx 2MB"}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          isLoading={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {avatarUrl ? "Cambiar foto" : "Subir foto"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleAvatarChange(file);
          }}
        />
      </div>
    </div>
  );
}
