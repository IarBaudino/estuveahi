import Link from "next/link";
import type { AdminListingExpiryAlert } from "@/features/events/infrastructure/event.repository";
import { routes } from "@/config/routes";
import { formatListingExpiryDate } from "@/shared/lib/event-listing";
import { Button } from "@/shared/ui/button";

export function AdminListingExpiryAlerts({
  alerts,
}: {
  alerts: AdminListingExpiryAlert[];
}) {
  if (alerts.length === 0) return null;

  const expired = alerts.filter((alert) => alert.status === "expired");
  const warning = alerts.filter((alert) => alert.status === "warning");

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-amber-100">Cartelera por vencer</h2>
      <p className="mt-1 text-sm text-amber-100/80">
        Los eventos publicados duran 30 días en cartelera. Eliminalos cuando venzan para liberar
        espacio en Supabase.
      </p>

      <div className="mt-4 space-y-3">
        {warning.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-200/80">
              Por vencer ({warning.length})
            </p>
            <ul className="space-y-2">
              {warning.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </ul>
          </div>
        )}

        {expired.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-red-300/80">
              Vencidos — eliminar ({expired.length})
            </p>
            <ul className="space-y-2">
              {expired.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </ul>
          </div>
        )}
      </div>

      <Link href={routes.admin.events} className="mt-4 inline-block">
        <Button size="sm" variant="outline">
          Ir a eventos
        </Button>
      </Link>
    </div>
  );
}

function AlertRow({ alert }: { alert: AdminListingExpiryAlert }) {
  const isExpired = alert.status === "expired";

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
      <div>
        <p className="font-medium">{alert.title}</p>
        <p className="text-xs text-on-surface-variant">
          {alert.photographerName} · {alert.photoCount} fotos ·{" "}
          {isExpired
            ? `venció el ${formatListingExpiryDate(alert.listingExpiresAt)}`
            : `vence el ${formatListingExpiryDate(alert.listingExpiresAt)} (${alert.daysRemaining} d)`}
        </p>
      </div>
      <Link href={routes.admin.event(alert.id)}>
        <Button size="sm" variant={isExpired ? "destructive" : "secondary"}>
          {isExpired ? "Eliminar" : "Gestionar"}
        </Button>
      </Link>
    </li>
  );
}
