"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/features/auth/application/schemas/auth.schema";
import { changePasswordAction } from "@/features/auth/presentation/actions/auth.actions";
import { Button } from "@/shared/ui/button";
import { PasswordInput } from "@/shared/ui/password-input";
import { routes } from "@/config/routes";
import { emitToastSuccess } from "@/shared/lib/toast-bus";

export function ChangePasswordForm() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const { execute, isExecuting, result } = useAction(changePasswordAction, {
    onSuccess: ({ data }) => {
      if (data?.signedOut) {
        setDone(true);
        reset();
        emitToastSuccess("Contraseña actualizada");
        setTimeout(() => {
          router.push(`${routes.login}?passwordChanged=1`);
          router.refresh();
        }, 1500);
      }
    },
  });

  if (done) {
    return (
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
        Contraseña actualizada. Te redirigimos a iniciar sesión…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
      <PasswordInput
        label="Contraseña actual"
        autoComplete="current-password"
        {...register("currentPassword")}
        error={errors.currentPassword?.message}
      />
      <PasswordInput
        label="Contraseña nueva"
        autoComplete="new-password"
        {...register("newPassword")}
        error={errors.newPassword?.message}
      />
      <PasswordInput
        label="Confirmar contraseña nueva"
        autoComplete="new-password"
        {...register("confirmNewPassword")}
        error={errors.confirmNewPassword?.message}
      />
      {result.serverError && (
        <p className="text-sm text-red-500">{result.serverError}</p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" isLoading={isExecuting}>
          Guardar contraseña
        </Button>
        <Link
          href={routes.forgotPassword}
          className="text-sm text-zinc-500 underline hover:text-zinc-300"
        >
          ¿Olvidaste tu contraseña actual?
        </Link>
      </div>
    </form>
  );
}
