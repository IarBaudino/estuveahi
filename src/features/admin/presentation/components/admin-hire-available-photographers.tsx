import Link from "next/link";
import {
  ARGENTINA_PROVINCE_LABELS,
  type ArgentinaProvince,
} from "@/domain/enums/argentina-province";
import type { HireLeadPhotographerSummary } from "@/domain/entities/hire-lead";
import { routes } from "@/config/routes";
import { Badge } from "@/shared/ui/badge";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

type AvailablePhotographer = Omit<
  HireLeadPhotographerSummary,
  "alreadyNotified" | "leadStatus"
>;

export function AdminHireAvailablePhotographers({
  photographers,
}: {
  photographers: AvailablePhotographer[];
}) {
  if (photographers.length === 0) {
    return (
      <p className="text-on-surface-variant">
        Todavía nadie activó disponibilidad ni provincias. Cuando un{" "}
        {PHOTOGRAPHER_LABEL.singular} lo haga en su perfil, aparece acá.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto hairline-border">
      <table className="w-full text-sm">
        <thead className="border-b border-white/10 bg-surface-container">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{PHOTOGRAPHER_LABEL.singularCap}</th>
            <th className="px-4 py-3 text-left font-medium">Contacto</th>
            <th className="px-4 py-3 text-left font-medium">Provincias</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {photographers.map((photographer) => (
            <tr key={photographer.id}>
              <td className="px-4 py-3">
                <Link
                  href={routes.photographerPublic(photographer.id)}
                  className="font-medium hover:underline"
                >
                  {photographer.displayName}
                </Link>
              </td>
              <td className="px-4 py-3 text-on-surface-variant">
                <p>{photographer.email ?? "—"}</p>
                {photographer.phone && (
                  <p className="text-xs">{photographer.phone}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex max-w-md flex-wrap gap-1.5">
                  {photographer.coverageProvinces.map((province) => (
                    <Badge key={province} variant="outline">
                      {ARGENTINA_PROVINCE_LABELS[province as ArgentinaProvince] ??
                        province}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                {photographer.isVerified ? (
                  <Badge variant="success">Verificadx</Badge>
                ) : (
                  <Badge variant="warning">Sin verificar</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
