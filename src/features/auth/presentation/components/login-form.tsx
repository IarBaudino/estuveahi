"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/features/auth/application/schemas/auth.schema";
import { loginAction } from "@/features/auth/presentation/actions/auth.actions";
import { getDashboardForRole } from "@/shared/lib/auth-redirect";
import type { UserRole } from "@/domain/enums/roles";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { routes } from "@/config/routes";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? routes.home;
  const isBlocked = searchParams.get("blocked") === "1";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const { execute, isExecuting, result } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      const hasCustomCallback =
        callbackUrl !== routes.home && !callbackUrl.startsWith(routes.login);
      const destination = hasCustomCallback
        ? callbackUrl
        : getDashboardForRole((data?.role ?? "client") as UserRole);
      router.push(destination);
      router.refresh();
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Ingresa a tu cuenta de EstuveAhí</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
        {isBlocked && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            Tu cuenta fue suspendida. Contactá al administrador de EstuveAhí.
          </p>
        )}
        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <div className="space-y-1.5">
          <PasswordInput
            label="Contraseña"
            autoComplete="current-password"
            {...register("password")}
            error={errors.password?.message}
          />
          <p className="text-right">
            <Link
              href={routes.forgotPassword}
              className="text-xs text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>
        {result.serverError && (
          <p className="text-sm text-red-500">{result.serverError}</p>
        )}
        <Button type="submit" className="w-full" isLoading={isExecuting}>
          Ingresar
        </Button>
        <p className="text-center text-sm text-zinc-500">
          ¿No tienes cuenta?{" "}
          <Link href={routes.register} className="font-medium text-zinc-900 dark:text-white">
            Regístrate
          </Link>
        </p>
      </form>
    </Card>
  );
}
