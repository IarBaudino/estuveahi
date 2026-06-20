"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import type { PhotographerApplicationForAdmin } from "@/domain/entities/user";
import {
  approvePhotographerApplicationAction,
  rejectPhotographerApplicationAction,
} from "@/features/auth/presentation/actions/auth.actions";
import { Button } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/utils";
import { getDisplayName } from "@/shared/lib/profile";

export function AdminPhotographerApplicationsTable({
  applications,
}: {
  applications: PhotographerApplicationForAdmin[];
}) {
  const router = useRouter();
  const { execute: approve, isExecuting: approving } = useAction(
    approvePhotographerApplicationAction,
    { onSuccess: () => router.refresh() },
  );
  const { execute: reject, isExecuting: rejecting } = useAction(
    rejectPhotographerApplicationAction,
    { onSuccess: () => router.refresh() },
  );

  if (applications.length === 0) {
    return (
      <p className="text-on-surface-variant">No hay solicitudes de fotógrafos pendientes.</p>
    );
  }

  return (
    <div className="overflow-x-auto hairline-border">
      <table className="w-full text-sm">
        <thead className="border-b border-white/10 bg-surface-container">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Solicitante</th>
            <th className="px-4 py-3 text-left font-medium">Nombre público</th>
            <th className="px-4 py-3 text-left font-medium">Contacto</th>
            <th className="px-4 py-3 text-left font-medium">Bio</th>
            <th className="px-4 py-3 text-left font-medium">Fecha</th>
            <th className="px-4 py-3 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {applications.map((app) => (
            <tr key={app.userId}>
              <td className="px-4 py-3 font-medium">
                {getDisplayName({
                  firstName: app.firstName,
                  lastName: app.lastName,
                  email: app.email,
                  phone: app.phone,
                })}
              </td>
              <td className="px-4 py-3">{app.displayName}</td>
              <td className="px-4 py-3">
                <div>{app.email}</div>
                {app.phone && (
                  <div className="text-xs text-on-surface-variant">{app.phone}</div>
                )}
                {app.instagramHandle && (
                  <div className="text-xs text-on-surface-variant">{app.instagramHandle}</div>
                )}
              </td>
              <td className="max-w-xs px-4 py-3 text-on-surface-variant">
                {app.bio ?? "—"}
              </td>
              <td className="px-4 py-3">{formatDate(app.submittedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    isLoading={approving}
                    onClick={() => {
                      if (
                        confirm(
                          `¿Aprobar a "${app.displayName}" como fotógrafo? Podrá crear eventos y subir fotos.`,
                        )
                      ) {
                        approve({ userId: app.userId });
                      }
                    }}
                  >
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    isLoading={rejecting}
                    onClick={() => {
                      if (
                        confirm(
                          `¿Rechazar la solicitud de "${app.displayName}"?`,
                        )
                      ) {
                        reject({ userId: app.userId });
                      }
                    }}
                  >
                    Rechazar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
