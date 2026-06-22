import { getAdminStats } from "@/features/events/infrastructure/event.repository";
import { getAnalyticsSummary } from "@/features/analytics/infrastructure/analytics.repository";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Users, Calendar, Camera, ShoppingBag, Eye, UserCheck, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const [stats, traffic] = await Promise.all([getAdminStats(), getAnalyticsSummary()]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Panel de administración</h1>
      <p className="text-zinc-500">Vista general de la plataforma</p>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Tráfico web</h2>
        <p className="text-sm text-zinc-500">
          Visitas a páginas públicas (incluye quienes no iniciaron sesión). No cuenta el panel de
          fotógrafos, clientes ni admin.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> Visitas hoy
              </CardDescription>
              <CardTitle className="text-3xl">{traffic.pageViewsToday}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" /> Personas hoy
              </CardDescription>
              <CardTitle className="text-3xl">{traffic.uniqueVisitorsToday}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Últimos 7 días
              </CardDescription>
              <CardTitle className="text-3xl">{traffic.pageViewsWeek}</CardTitle>
              <p className="text-sm text-zinc-500">
                {traffic.uniqueVisitorsWeek} personas distintas
              </p>
            </CardHeader>
          </Card>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Total histórico de visitas: {traffic.pageViewsTotal}
        </p>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Plataforma</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Usuarios
              </CardDescription>
              <CardTitle className="text-3xl">{stats.users}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Eventos
              </CardDescription>
              <CardTitle className="text-3xl">{stats.events}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Camera className="h-4 w-4" /> Fotografías
              </CardDescription>
              <CardTitle className="text-3xl">{stats.photos}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Solicitudes pendientes
              </CardDescription>
              <CardTitle className="text-3xl">{stats.pendingRequests}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
