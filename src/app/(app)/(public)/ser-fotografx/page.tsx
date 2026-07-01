"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  photographerOnboardingSchema,
  type PhotographerOnboardingInput,
} from "@/features/auth/application/schemas/auth.schema";
import { becomePhotographerAction } from "@/features/auth/presentation/actions/auth.actions";
import { PhotographerOnboardingInfoModal } from "@/features/auth/presentation/components/photographer-onboarding-info-modal";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

export default function BecomePhotographerPage() {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhotographerOnboardingInput>({
    resolver: zodResolver(photographerOnboardingSchema),
  });

  const { execute, isExecuting, result } = useAction(becomePhotographerAction, {
    onSuccess: () => {
      router.push(routes.photographer.dashboard);
      router.refresh();
    },
  });

  return (
    <>
      {showInfo && (
        <PhotographerOnboardingInfoModal onContinue={() => setShowInfo(false)} />
      )}

      <div
        className={cn(
          "mx-auto max-w-lg px-margin-mobile py-12 transition-opacity md:px-margin-desktop",
          showInfo && "pointer-events-none opacity-30",
        )}
      >
        <div className="mb-6">
          <Link href={routes.photographers} className="text-sm text-on-surface-variant underline">
            ← Ver {PHOTOGRAPHER_LABEL.plural}
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Convertite en {PHOTOGRAPHER_LABEL.singular}</CardTitle>
            <CardDescription>
              Completá tu perfil para enviar la solicitud de admisión.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
            <Input
              label="Nombre público"
              {...register("displayName")}
              error={errors.displayName?.message}
            />
            <Textarea label="Bio" {...register("bio")} rows={3} />
            <Input label="Sitio web" {...register("websiteUrl")} placeholder="https://" />
            <Input
              label="Instagram"
              {...register("instagramHandle")}
              placeholder="@tuusuario"
            />
            {result.serverError && (
              <p className="text-sm text-red-500">{result.serverError}</p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="flex-1" isLoading={isExecuting} disabled={showInfo}>
                Enviar solicitud
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowInfo(true)}
              >
                Ver indicaciones
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
