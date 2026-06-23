"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  updateUserRoleAction,
  verifyPhotographerAction,
  unverifyPhotographerAction,
} from "@/features/auth/presentation/actions/auth.actions";
import { setUserBlockedAction } from "@/features/profile/presentation/actions/profile.actions";
import type { AdminUserListItem } from "@/features/events/infrastructure/event.repository";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { getDisplayName } from "@/shared/lib/profile";
import { showAdminActionError } from "@/shared/lib/admin-action-feedback";

const ROLE_LABELS: Record<AdminUserListItem["role"], string> = {
  client: "Cliente",
  photographer: PHOTOGRAPHER_LABEL.singularCap,
  admin: "Admin",
};

export function AdminUsersTable({ users }: { users: AdminUserListItem[] }) {
  const router = useRouter();
  const actionOptions = {
    onSuccess: () => router.refresh(),
    onError: ({ error }: { error: { serverError?: string; validationErrors?: unknown } }) =>
      showAdminActionError(error),
  };

  const { execute: updateRole, isExecuting: updatingRole } = useAction(
    updateUserRoleAction,
    actionOptions,
  );
  const { execute: verify, isExecuting: verifying } = useAction(
    verifyPhotographerAction,
    actionOptions,
  );
  const { execute: unverify, isExecuting: unverifying } = useAction(
    unverifyPhotographerAction,
    actionOptions,
  );
  const { execute: setBlocked, isExecuting: blocking } = useAction(
    setUserBlockedAction,
    actionOptions,
  );

  if (users.length === 0) {
    return <p className="text-on-surface-variant">No hay usuarios registrados.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Usuario</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Teléfono</th>
            <th className="px-4 py-3 text-left font-medium">Rol</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
            <th className="px-4 py-3 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {users.map((user) => (
            <tr key={user.id} className={user.isBlocked ? "opacity-60" : undefined}>
              <td className="px-4 py-3">
                {getDisplayName({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: user.phone,
                })}
              </td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.phone ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge>{ROLE_LABELS[user.role]}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {user.isBlocked ? (
                    <Badge variant="destructive">Bloqueado</Badge>
                  ) : (
                    <Badge variant="outline">Activo</Badge>
                  )}
                  {user.role === "photographer" && user.photographerIsVerified && (
                    <Badge variant="success">Verificado</Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {user.role !== "photographer" && user.role !== "admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={user.isBlocked}
                      isLoading={updatingRole}
                      onClick={() => {
                        const name = getDisplayName({
                          firstName: user.firstName,
                          lastName: user.lastName,
                          email: user.email,
                          phone: user.phone,
                        });
                        if (
                          confirm(
                            `¿Convertir a ${name} en ${PHOTOGRAPHER_LABEL.singular}? Podrá crear eventos y subir fotos.`,
                          )
                        ) {
                          updateRole({ userId: user.id, role: "photographer" });
                        }
                      }}
                    >
                      Hacer {PHOTOGRAPHER_LABEL.singular}
                    </Button>
                  )}
                  {user.role === "photographer" && !user.isBlocked && (
                    user.photographerIsVerified ? (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={unverifying}
                        onClick={() => {
                          const name = getDisplayName({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            phone: user.phone,
                          });
                          if (confirm(`¿Quitar la verificación de ${name}?`)) {
                            unverify({ userId: user.id });
                          }
                        }}
                      >
                        Quitar verificación
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={verifying}
                        onClick={() => verify({ userId: user.id })}
                      >
                        Verificar
                      </Button>
                    )
                  )}
                  {user.role === "client" && !user.isBlocked && (
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={updatingRole}
                      onClick={() => {
                        const name = getDisplayName({
                          firstName: user.firstName,
                          lastName: user.lastName,
                          email: user.email,
                          phone: user.phone,
                        });
                        if (confirm(`¿Dar permisos de administrador a ${name}?`)) {
                          updateRole({ userId: user.id, role: "admin" });
                        }
                      }}
                    >
                      Hacer admin
                    </Button>
                  )}
                  {user.role !== "admin" && (
                    <Button
                      size="sm"
                      variant={user.isBlocked ? "outline" : "destructive"}
                      isLoading={blocking}
                      onClick={() => {
                        const name = getDisplayName({
                          firstName: user.firstName,
                          lastName: user.lastName,
                          email: user.email,
                          phone: user.phone,
                        });
                        const action = user.isBlocked ? "desbloquear" : "bloquear";
                        if (confirm(`¿${action} a ${name}?`)) {
                          setBlocked({ userId: user.id, blocked: !user.isBlocked });
                        }
                      }}
                    >
                      {user.isBlocked ? "Desbloquear" : "Bloquear"}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
