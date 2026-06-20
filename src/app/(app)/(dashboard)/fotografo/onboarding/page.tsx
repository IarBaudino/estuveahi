"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const { update } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhotographerOnboardingInput>({
    resolver: zodResolver(photographerOnboardingSchema),
  });

  const { execute, isExecuting, result } = useAction(becomePhotographerAction, {
    onSuccess: async () => {
      await update({ role: "photographer" });
      router.push(routes.photographer.dashboard);
      router.refresh();
    },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Conviértete en fotógrafo</CardTitle>
          <CardDescription>
            Completa tu perfil para empezar a subir y vender fotografías
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
            Crear perfil de fotógrafo
          </Button>
        </form>
      </Card>
    </div>
  );
}
