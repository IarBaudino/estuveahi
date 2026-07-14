"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PhotographerProfile } from "@/domain/entities/user";
import {
  photographerProfileUpdateSchema,
  type PhotographerProfileUpdateInput,
} from "@/features/auth/application/schemas/auth.schema";
import { updatePhotographerProfileAction } from "@/features/auth/presentation/actions/auth.actions";
import {
  ARGENTINA_PROVINCE_LABELS,
  argentinaProvinceValues,
  type ArgentinaProvince,
} from "@/domain/enums/argentina-province";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { actionFeedback } from "@/shared/lib/action-feedback";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

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
    watch,
    setValue,
    formState: { errors },
  } = useForm<PhotographerProfileUpdateInput>({
    resolver: zodResolver(photographerProfileUpdateSchema),
    defaultValues: {
      displayName: profile.displayName,
      bio: profile.bio ?? "",
      websiteUrl: profile.websiteUrl ?? "",
      instagramHandle: profile.instagramHandle ?? "",
      coverageProvinces: (profile.coverageProvinces ?? []) as ArgentinaProvince[],
      availableForHire: profile.availableForHire,
      isPublicProfile: profile.isPublicProfile,
    },
  });

  const coverageProvinces = watch("coverageProvinces") ?? [];
  const availableForHire = watch("availableForHire");
  const isPublicProfile = watch("isPublicProfile");

  const { execute, isExecuting, result } = useAction(
    updatePhotographerProfileAction,
    actionFeedback({ onSuccess: () => router.refresh() }),
  );

  function toggleProvince(province: ArgentinaProvince) {
    const next = coverageProvinces.includes(province)
      ? coverageProvinces.filter((item) => item !== province)
      : [...coverageProvinces, province];
    setValue("coverageProvinces", next, { shouldDirty: true });
  }

  return (
    <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-on-surface-variant">{email}</p>
        {profile.isVerified && (
          <Badge variant="outline">Fotógrafo verificado</Badge>
        )}
        <Badge variant={isPublicProfile ? "success" : "warning"}>
          {isPublicProfile ? "Perfil activo" : "Perfil oculto"}
        </Badge>
      </div>

      <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-950/40 p-4">
        <div>
          <h3 className="text-sm font-medium">Visibilidad del perfil</h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            Si lo desactivás, no aparecés en el directorio de {PHOTOGRAPHER_LABEL.plural} ni
            en avisos de contratación. Tus eventos publicados siguen en el catálogo.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublicProfile}
            onChange={(e) =>
              setValue("isPublicProfile", e.target.checked, { shouldDirty: true })
            }
            className="rounded"
          />
          Perfil público activo
        </label>
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

      <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-950/40 p-4">
        <div>
          <h3 className="text-sm font-medium">Cobertura para contratar</h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            Indicá dónde trabajás. El admin te puede avisar cuando haya una consulta
            en esas provincias; vos contactás al interesado por WhatsApp.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={availableForHire}
            onChange={(e) =>
              setValue("availableForHire", e.target.checked, { shouldDirty: true })
            }
            className="rounded"
          />
          Quiero recibir consultas de contratación
        </label>

        <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {argentinaProvinceValues.map((province) => {
            const checked = coverageProvinces.includes(province);
            return (
              <label
                key={province}
                className="flex items-center gap-2 text-xs text-on-surface-variant"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleProvince(province)}
                  className="rounded"
                />
                {ARGENTINA_PROVINCE_LABELS[province]}
              </label>
            );
          })}
        </div>
        {errors.coverageProvinces?.message && (
          <p className="text-xs text-error">{errors.coverageProvinces.message}</p>
        )}
      </div>

      {result.serverError && (
        <p className="text-sm text-error">{result.serverError}</p>
      )}

      <Button type="submit" isLoading={isExecuting}>
        Guardar perfil público
      </Button>
    </form>
  );
}
