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
import type { Profile } from "@/domain/entities/user";
import { getDisplayName } from "@/shared/lib/profile";

export function AdminUsersTable({ users }: { users: Profile[] }) {
  const router = useRouter();
  const { execute: updateRole } = useAction(updateUserRoleAction, {
    onSuccess: () => router.refresh(),
  });
  const { execute: verify } = useAction(verifyPhotographerAction, {
    onSuccess: () => router.refresh(),
  });
  const { execute: unverify } = useAction(unverifyPhotographerAction, {
    onSuccess: () => router.refresh(),
  });
  const { execute: setBlocked, isExecuting: blocking } = useAction(
    setUserBlockedAction,
    { onSuccess: () => router.refresh() },
  );

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
                <Badge>{user.role}</Badge>
              </td>
              <td className="px-4 py-3">
                {user.isBlocked ? (
                  <Badge variant="destructive">Bloqueado</Badge>
                ) : (
                  <Badge variant="outline">Activo</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {user.role !== "photographer" && user.role !== "admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={user.isBlocked}
                      onClick={() =>
                        updateRole({ userId: user.id, role: "photographer" })
                      }
                    >
                      Hacer fotógrafo
                    </Button>
                  )}
                  {user.role === "photographer" && !user.isBlocked && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => verify({ userId: user.id })}
                      >
                        Verificar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unverify({ userId: user.id })}
                      >
                        Quitar verificación
                      </Button>
                    </>
                  )}
                  {user.role === "client" && !user.isBlocked && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateRole({ userId: user.id, role: "admin" })
                      }
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
