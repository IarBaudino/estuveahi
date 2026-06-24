import type { AnalyticsReport } from "@/features/analytics/infrastructure/analytics.repository";
import { TRAFFIC_SECTION_META } from "@/features/analytics/domain/traffic-sections";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Eye, UserCheck, TrendingUp, BookOpen } from "lucide-react";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

function formatRatio(value: number | null): string {
  if (value == null) return "—";
  return value.toFixed(1).replace(".", ",");
}

interface AdminTrafficPanelProps {
  traffic: AnalyticsReport;
}

export function AdminTrafficPanel({ traffic }: AdminTrafficPanelProps) {
  const maxDailyViews = Math.max(...traffic.dailyLast7Days.map((row) => row.pageViews), 1);
  const hasSectionData = traffic.sections.length > 0;
  const hasPathData = traffic.topPathsWeek.length > 0;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        <div className="flex gap-2 font-medium text-zinc-800 dark:text-zinc-200">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />
          ¿Qué estamos midiendo?
        </div>
        <ul className="mt-3 list-inside list-disc space-y-1.5">
          <li>
            <strong>Visitas (páginas vistas):</strong> cada vez que alguien abre una página
            pública. Si la misma persona mira 3 galerías, son 3 visitas.
          </li>
          <li>
            <strong>Personas:</strong> dispositivos distintos por día (se identifican con un ID
            anónimo en el navegador, sin login).
          </li>
          <li>
            <strong>No se cuenta:</strong> panel de admin, fotografx, clientes ni llamadas a la API.
          </li>
          <li>
            <strong>Zona horaria:</strong> día calendario de Argentina (Buenos Aires).
          </li>
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Visitas hoy
            </CardDescription>
            <CardTitle className="text-3xl">{formatNumber(traffic.pageViewsToday)}</CardTitle>
            <p className="text-sm text-zinc-500">Páginas públicas abiertas hoy</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Personas hoy
            </CardDescription>
            <CardTitle className="text-3xl">{formatNumber(traffic.uniqueVisitorsToday)}</CardTitle>
            <p className="text-sm text-zinc-500">
              Promedio {formatRatio(traffic.pagesPerVisitorToday)} páginas por persona
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Últimos 7 días
            </CardDescription>
            <CardTitle className="text-3xl">{formatNumber(traffic.pageViewsWeek)}</CardTitle>
            <p className="text-sm text-zinc-500">
              {formatNumber(traffic.uniqueVisitorsWeek)} personas-día ·{" "}
              {formatRatio(traffic.pagesPerVisitorWeek)} páginas c/u
            </p>
            <p className="text-xs text-zinc-400">
              Si alguien entra varios días, se cuenta una vez por cada día.
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total histórico</CardDescription>
            <CardTitle className="text-3xl">{formatNumber(traffic.pageViewsTotal)}</CardTitle>
            <p className="text-sm text-zinc-500">Visitas desde que activamos el contador</p>
          </CardHeader>
        </Card>
      </div>

      <section>
        <h3 className="text-base font-semibold">Últimos 7 días</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Desglose diario de visitas y personas únicas.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Día</th>
                <th className="px-4 py-3 text-right font-medium">Visitas</th>
                <th className="px-4 py-3 text-right font-medium">Personas</th>
                <th className="px-4 py-3 text-left font-medium">Actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {traffic.dailyLast7Days.map((row) => (
                <tr key={row.dateKey}>
                  <td className="px-4 py-3 font-medium">{row.dayLabel}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(row.pageViews)}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(row.uniqueVisitors)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-primary/80"
                          style={{
                            width: `${Math.max(4, (row.pageViews / maxDailyViews) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold">¿Dónde navegan?</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Tipo de página visitada. Los datos detallados por URL se acumulan desde este despliegue.
        </p>
        {!hasSectionData ? (
          <p className="mt-4 text-sm text-zinc-500">
            Todavía no hay visitas clasificadas en el período. Apenas haya tráfico público vas a ver
            el desglose acá.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Sección</th>
                  <th className="px-4 py-3 text-right font-medium">Hoy</th>
                  <th className="px-4 py-3 text-right font-medium">7 días</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {traffic.sections.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.label}</p>
                      <p className="text-xs text-zinc-500">{row.description}</p>
                    </td>
                    <td className="px-4 py-3 text-right">{formatNumber(row.today)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(row.week)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-base font-semibold">Páginas más visitadas (7 días)</h3>
        <p className="mt-1 text-sm text-zinc-500">
          URLs concretas con más aperturas en la semana.
        </p>
        {!hasPathData ? (
          <p className="mt-4 text-sm text-zinc-500">
            Sin datos de URLs todavía. Aparecerán cuando haya visitas después de este update.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Página</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-right font-medium">Visitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {traffic.topPathsWeek.map((row) => (
                  <tr key={row.path}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.label}</p>
                      <p className="font-mono text-xs text-zinc-500">{row.path}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {TRAFFIC_SECTION_META[row.section].label}
                    </td>
                    <td className="px-4 py-3 text-right">{formatNumber(row.views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
