"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import type { HireLeadWithRequest } from "@/domain/entities/hire-lead";
import { ARGENTINA_PROVINCE_LABELS } from "@/domain/enums/argentina-province";
import {
  HIRE_LEAD_STATUS_LABELS,
  HireLeadStatus,
} from "@/domain/enums/hire-lead-status";
import { updateHireLeadStatusAction } from "@/features/hire-requests/presentation/actions/hire-request.actions";
import { buildHireLeadClientWhatsAppMessage } from "@/features/hire-requests/presentation/lib/hire-request-whatsapp";
import { WhatsAppContactButton } from "@/features/purchase-requests/presentation/components/whatsapp-contact-button";
import { formatDate } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";

function leadVariant(status: HireLeadWithRequest["status"]) {
  if (status === HireLeadStatus.INTERESTED) return "success" as const;
  if (status === HireLeadStatus.PASSED) return "outline" as const;
  return "warning" as const;
}

function HireLeadCard({
  lead,
  photographerDisplayName,
}: {
  lead: HireLeadWithRequest;
  photographerDisplayName?: string | null;
}) {
  const router = useRouter();
  const { execute, isExecuting } = useAction(updateHireLeadStatusAction, {
    onSuccess: () => router.refresh(),
  });

  const location = [
    lead.request.city,
    ARGENTINA_PROVINCE_LABELS[lead.request.province],
  ]
    .filter(Boolean)
    .join(", ");

  const message = buildHireLeadClientWhatsAppMessage({
    requesterName: lead.request.name,
    eventType: lead.request.eventType,
    province: lead.request.province,
    city: lead.request.city,
    photographerDisplayName,
  });

  return (
    <article className="space-y-3 rounded-xl border border-white/10 bg-zinc-950/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{lead.request.eventType}</p>
          <p className="text-sm text-on-surface-variant">
            {lead.request.name}
            {location ? ` · ${location}` : ""}
          </p>
          {lead.request.eventDate && (
            <p className="text-xs text-on-surface-variant">
              Fecha aprox.: {lead.request.eventDate}
            </p>
          )}
        </div>
        <Badge variant={leadVariant(lead.status)}>
          {HIRE_LEAD_STATUS_LABELS[lead.status]}
        </Badge>
      </div>

      <p className="text-sm text-on-surface-variant">{lead.request.message}</p>

      <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
        <span>Avisado: {formatDate(lead.createdAt)}</span>
        {lead.request.email && <span>· {lead.request.email}</span>}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <WhatsAppContactButton phone={lead.request.phone} message={message} />
        <select
          className="h-10 rounded-lg border border-white/15 bg-zinc-950 px-3 text-xs"
          value={lead.status}
          disabled={isExecuting}
          onChange={(e) =>
            execute({
              leadId: lead.id,
              status: e.target.value as HireLeadWithRequest["status"],
            })
          }
        >
          {Object.entries(HIRE_LEAD_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}

export function PhotographerHireLeadsList({
  leads,
  photographerDisplayName,
}: {
  leads: HireLeadWithRequest[];
  photographerDisplayName?: string | null;
}) {
  if (leads.length === 0) {
    return (
      <p className="text-on-surface-variant">
        Todavía no te avisaron de consultas para contratar en tu zona.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <HireLeadCard
          key={lead.id}
          lead={lead}
          photographerDisplayName={photographerDisplayName}
        />
      ))}
    </div>
  );
}
