"use client";

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
} from "@/features/profile/presentation/actions/profile.actions";
import { ProfileAvatarUploader } from "@/features/profile/presentation/components/profile-avatar-uploader";
import { isProfileComplete } from "@/shared/lib/profile";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { actionFeedback } from "@/shared/lib/action-feedback";

interface ProfileFormProps {
  profile: Profile;
  hideAvatar?: boolean;
}

export function ProfileForm({ profile, hideAvatar = false }: ProfileFormProps) {
  const router = useRouter();

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

  const { execute: save, isExecuting, result } = useAction(
    updateProfileAction,
    actionFeedback({ onSuccess: () => router.refresh() }),
  );

  const complete = isProfileComplete({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
  });

  return (
    <div className="space-y-8">
      {!hideAvatar && (
        <div className="flex flex-wrap items-center gap-4">
          <ProfileAvatarUploader
            avatarUrl={profile.avatarUrl}
            variant="account"
          />
          {complete ? (
            <Badge variant="default">Perfil completo</Badge>
          ) : (
            <Badge variant="outline">Completá tu perfil para comprar fotos</Badge>
          )}
        </div>
      )}

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
