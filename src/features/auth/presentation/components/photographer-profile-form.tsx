"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PhotographerProfile } from "@/domain/entities/user";
import {
  photographerOnboardingSchema,
  type PhotographerOnboardingInput,
} from "@/features/auth/application/schemas/auth.schema";
import { updatePhotographerProfileAction } from "@/features/auth/presentation/actions/auth.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";

interface PhotographerProfileFormProps {
  profile: PhotographerProfile;
  email: string;
}

export function PhotographerProfileForm({
  profile,
  email,
}: PhotographerProfileFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhotographerOnboardingInput>({
    resolver: zodResolver(photographerOnboardingSchema),
    defaultValues: {
      displayName: profile.displayName,
      bio: profile.bio ?? "",
      websiteUrl: profile.websiteUrl ?? "",
      instagramHandle: profile.instagramHandle ?? "",
    },
  });

  const { execute, isExecuting, result } = useAction(
    updatePhotographerProfileAction,
    { onSuccess: () => router.refresh() },
  );

  return (
    <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-on-surface-variant">{email}</p>
        {profile.isVerified && (
          <Badge variant="outline">Fotógrafo verificado</Badge>
        )}
      </div>

      <Input
        label="Nombre público"
        {...register("displayName")}
        error={errors.displayName?.message}
      />
      <Textarea label="Bio" {...register("bio")} rows={4} />
      <Input
        label="Sitio web"
        {...register("websiteUrl")}
        placeholder="https://"
        error={errors.websiteUrl?.message}
      />
      <Input
        label="Instagram"
        {...register("instagramHandle")}
        placeholder="@tuusuario"
      />

      {result.serverError && (
        <p className="text-sm text-error">{result.serverError}</p>
      )}

      <Button type="submit" isLoading={isExecuting}>
        Guardar perfil público
      </Button>
    </form>
  );
}
