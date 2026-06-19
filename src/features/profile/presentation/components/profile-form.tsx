"use client";

import { useRef } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Profile } from "@/domain/entities/user";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/features/profile/application/schemas/profile.schema";
import {
  updateProfileAction,
  uploadAvatarAction,
} from "@/features/profile/presentation/actions/profile.actions";
import { isProfileComplete } from "@/shared/lib/profile";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { User } from "lucide-react";
import Image from "next/image";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      phone: profile.phone ?? "",
    },
  });

  const { execute: save, isExecuting, result } = useAction(updateProfileAction, {
    onSuccess: () => router.refresh(),
  });

  const { execute: uploadAvatar, isExecuting: uploading } = useAction(
    uploadAvatarAction,
    { onSuccess: () => router.refresh() },
  );

  const complete = isProfileComplete({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
  });

  async function handleAvatarChange(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
    if (file.size > 2 * 1024 * 1024) return;

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    uploadAvatar({
      mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
      fileBase64: base64,
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
        >
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt="Avatar"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <User className="h-8 w-8 text-zinc-400" />
          )}
        </button>
        <div>
          <p className="font-medium">Foto de perfil</p>
          <p className="text-sm text-zinc-500">Opcional · JPG, PNG o WebP · Máx 2MB</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            isLoading={uploading}
            onClick={() => fileRef.current?.click()}
          >
            Cambiar foto
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleAvatarChange(file);
            }}
          />
        </div>
        {complete ? (
          <Badge variant="default">Perfil completo</Badge>
        ) : (
          <Badge variant="outline">Completá tu perfil para comprar fotos</Badge>
        )}
      </div>

      <form onSubmit={handleSubmit((data) => save(data))} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre"
            {...register("firstName")}
            error={errors.firstName?.message}
          />
          <Input
            label="Apellido"
            {...register("lastName")}
            error={errors.lastName?.message}
          />
        </div>
        <Input label="Email" value={profile.email} disabled />
        <Input
          label="Teléfono"
          type="tel"
          placeholder="Ej: +54 11 1234-5678"
          {...register("phone")}
          error={errors.phone?.message}
        />
        <p className="text-sm text-zinc-500">
          El fotógrafo verá estos datos cuando solicites una foto.
        </p>
        {result.serverError && (
          <p className="text-sm text-red-500">{result.serverError}</p>
        )}
        <Button type="submit" isLoading={isExecuting}>
          Guardar cambios
        </Button>
      </form>
    </div>
  );
}
