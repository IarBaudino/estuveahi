"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/application/schemas/auth.schema";
import { requestPasswordResetAction } from "@/features/auth/presentation/actions/auth.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { routes } from "@/config/routes";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { execute, isExecuting, result } = useAction(requestPasswordResetAction, {
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" aria-hidden />
          <CardTitle className="mt-4">Revisá tu correo</CardTitle>
          <CardDescription>
            Si existe una cuenta con ese email, te enviamos un enlace para restablecer tu
            contraseña. Revisá también la carpeta de spam.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <Link
            href={routes.login}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-background hover:opacity-90"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>
          Te enviaremos un enlace por email para elegir una contraseña nueva.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />
        {result.serverError && (
          <p className="text-sm text-red-500">{result.serverError}</p>
        )}
        <Button type="submit" className="w-full" isLoading={isExecuting}>
          Enviar enlace
        </Button>
        <p className="text-center text-sm text-zinc-500">
          <Link href={routes.login} className="font-medium text-zinc-900 dark:text-white">
            Volver a iniciar sesión
          </Link>
        </p>
      </form>
    </Card>
  );
}
