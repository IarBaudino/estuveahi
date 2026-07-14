"use client";

import { useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import type { HireRequest } from "@/domain/entities/hire-request";
import type { HireLeadPhotographerSummary } from "@/domain/entities/hire-lead";
import {
  ARGENTINA_PROVINCE_LABELS,
} from "@/domain/enums/argentina-province";
import {
  HIRE_REQUEST_STATUS_LABELS,
  HireRequestStatus,
} from "@/domain/enums/hire-request-status";
import { HIRE_LEAD_STATUS_LABELS } from "@/domain/enums/hire-lead-status";
import {
  notifyHirePhotographersAction,
  updateHireRequestStatusAction,
} from "@/features/hire-requests/presentation/actions/hire-request.actions";
import { buildAdminToPhotographerHireWhatsAppMessage } from "@/features/hire-requests/presentation/lib/hire-request-whatsapp";
import { WhatsAppContactButton } from "@/features/purchase-requests/presentation/components/whatsapp-contact-button";
import { formatDate } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

function statusVariant(status: HireRequest["status"]) {
  if (status === HireRequestStatus.PENDING) return "warning" as const;
  if (status === HireRequestStatus.CONTACTED) return "default" as const;
  return "outline" as const;
}

function HireRequestManagePanel({
  request,
  matches,
}: {
  request: HireRequest;
  matches: HireLeadPhotographerSummary[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(() =>
    matches.filter((m) => !m.alreadyNotified).map((m) => m.id),
  );

  const { execute: updateStatus, isExecuting: updatingStatus } = useAction(
    updateHireRequestStatusAction,
    { onSuccess: () => router.refresh() },
  );

  const { execute: notify, isExecuting: notifying, result } = useAction(
    notifyHirePhotographersAction,
    {
      onSuccess: () => {
        router.refresh();
      },
    },
  );

  const selectable = useMemo(
    () => matches.filter((m) => !m.alreadyNotified),
    [matches],
  );

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleAll() {
    if (selected.length === selectable.length) {
      setSelected([]);
      return;
    }
    setSelected(selectable.map((m) => m.id));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-lg border border-white/15 bg-zinc-950 px-2 text-xs"
          value={request.status}
          disabled={updatingStatus}
          onChange={(e) =>
            updateStatus({
              id: request.id,
              status: e.target.value as HireRequest["status"],
            })
          }
        >
          {Object.entries(HIRE_REQUEST_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? "Cerrar" : "Avisar fotografxs"}
        </Button>
      </div>

      {open && (
        <div className="mt-3 max-w-xl space-y-3 rounded-xl border border-white/10 bg-zinc-950/60 p-4">
          <div>
            <p className="text-sm font-medium">
              {PHOTOGRAPHER_LABEL.pluralCap} con cobertura en{" "}
              {ARGENTINA_PROVINCE_LABELS[request.province]}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Vos los contactás (WhatsApp) y/ o les mandás el aviso al panel. Ellos le
              escriben al interesado.
            </p>
          </div>

          {matches.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No hay fotografxs disponibles marcados para esa provincia. Pediles que
              carguen cobertura en su perfil.
            </p>
          ) : (
            <>
              {selectable.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-primary underline"
                >
                  {selected.length === selectable.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos los pendientes"}
                </button>
              )}

              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {matches.map((photographer) => {
                  const message = buildAdminToPhotographerHireWhatsAppMessage({
                    photographerDisplayName: photographer.displayName,
                    eventType: request.eventType,
                    province: request.province,
                    city: request.city,
                  });

                  return (
                    <li
                      key={photographer.id}
                      className="rounded-lg border border-white/10 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <label className="flex min-w-0 flex-1 items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="mt-1 rounded"
                            disabled={photographer.alreadyNotified}
                            checked={
                              photographer.alreadyNotified ||
                              selected.includes(photographer.id)
                            }
                            onChange={() => toggle(photographer.id)}
                          />
                          <span className="min-w-0">
                            <span className="font-medium">{photographer.displayName}</span>
                            {photographer.isVerified && (
                              <Badge variant="outline" className="ml-2">
                                Verificadx
                              </Badge>
                            )}
                            <span className="mt-0.5 block text-xs text-on-surface-variant">
                              {photographer.email ?? "Sin email"}
                              {photographer.alreadyNotified && photographer.leadStatus
                                ? ` · ${HIRE_LEAD_STATUS_LABELS[photographer.leadStatus]}`
                                : ""}
                            </span>
                          </span>
                        </label>
                        <WhatsAppContactButton
                          phone={photographer.phone}
                          message={message}
                          compact
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <Button
                type="button"
                size="sm"
                isLoading={notifying}
                disabled={selected.length === 0}
                onClick={() =>
                  notify({
                    hireRequestId: request.id,
                    photographerIds: selected,
                  })
                }
              >
                Enviar al panel ({selected.length})
              </Button>
              {result.data && (
                <p className="text-xs text-on-surface-variant">
                  Enviados: {result.data.created}. Ya estaban: {result.data.skipped}.
                </p>
              )}
              {result.serverError && (
                <p className="text-xs text-red-400">{result.serverError}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminHireRequestsTable({
  requests,
  matchesByRequestId,
}: {
  requests: HireRequest[];
  matchesByRequestId: Record<string, HireLeadPhotographerSummary[]>;
}) {
  if (requests.length === 0) {
    return (
      <p className="text-on-surface-variant">
        Todavía no hay consultas para contratar fotografx.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto hairline-border">
      <table className="w-full text-sm">
        <thead className="border-b border-white/10 bg-surface-container">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Contacto</th>
            <th className="px-4 py-3 text-left font-medium">Ubicación</th>
            <th className="px-4 py-3 text-left font-medium">Evento</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
            <th className="px-4 py-3 text-left font-medium">Fecha</th>
            <th className="px-4 py-3 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {requests.map((request) => (
            <tr key={request.id} className="align-top">
              <td className="px-4 py-3">
                <p className="font-medium">{request.name}</p>
                <p className="text-xs text-on-surface-variant">{request.email}</p>
                {request.phone && (
                  <p className="text-xs text-on-surface-variant">{request.phone}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <p>{ARGENTINA_PROVINCE_LABELS[request.province]}</p>
                {request.city && (
                  <p className="text-xs text-on-surface-variant">{request.city}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{request.eventType}</p>
                {request.eventDate && (
                  <p className="text-xs text-on-surface-variant">{request.eventDate}</p>
                )}
                <p className="mt-1 line-clamp-3 text-xs text-on-surface-variant">
                  {request.message}
                </p>
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(request.status)}>
                  {HIRE_REQUEST_STATUS_LABELS[request.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-on-surface-variant">
                {formatDate(request.createdAt)}
              </td>
              <td className="px-4 py-3">
                <HireRequestManagePanel
                  request={request}
                  matches={matchesByRequestId[request.id] ?? []}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
