"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  photographerOnboardingSchema,
  type PhotographerOnboardingInput,
} from "@/features/auth/application/schemas/auth.schema";
import { becomePhotographerAction } from "@/features/auth/presentation/actions/auth.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { routes } from "@/config/routes";

export default function PhotographerOnboardingPage() {
  const router = useRouter();
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
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Convertite en fotógrafo</CardTitle>
          <CardDescription>
            Completá tu perfil. Un administrador revisará tu solicitud antes de activar tu
            panel de fotógrafo.
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
          <Button type="submit" className="w-full" isLoading={isExecuting}>
            Enviar solicitud
          </Button>
        </form>
      </Card>
    </div>
  );
}
