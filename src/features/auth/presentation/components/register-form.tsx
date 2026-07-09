"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/application/schemas/auth.schema";
import { registerAction } from "@/features/auth/presentation/actions/auth.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { routes } from "@/config/routes";

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const { execute, isExecuting, result } = useAction(registerAction, {
    onSuccess: () => router.push(routes.login),
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Únete a EstuveAhí</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
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
        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label="Teléfono"
          type="tel"
          placeholder="Ej: +54 11 1234-5678"
          {...register("phone")}
          error={errors.phone?.message}
        />
        <PasswordInput
          label="Contraseña"
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <PasswordInput
          label="Confirmar contraseña"
          autoComplete="new-password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        {result.serverError && (
          <p className="text-sm text-red-500">{result.serverError}</p>
        )}
        <Button type="submit" className="w-full" isLoading={isExecuting}>
          Registrarse
        </Button>
        <p className="text-center text-xs text-zinc-500">
          Al registrarte aceptás los{" "}
          <Link href={routes.legal.terms} className="underline hover:text-zinc-300">
            Términos y Condiciones
          </Link>{" "}
          y la{" "}
          <Link href={routes.legal.privacy} className="underline hover:text-zinc-300">
            Política de Privacidad
          </Link>
          .
        </p>
        <p className="text-center text-sm text-zinc-500">
          ¿Querés publicar fotos de eventos?{" "}
          <Link href={routes.becomePhotographer} className="font-medium text-white hover:underline">
            Creá tu perfil de fotógrafo
          </Link>
        </p>
        <p className="text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{" "}
          <Link href={routes.login} className="font-medium text-white hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </Card>
  );
}
