import { getAdminStats } from "@/features/events/infrastructure/event.repository";
import { getAnalyticsReport } from "@/features/analytics/infrastructure/analytics.repository";
import { AdminTrafficPanel } from "@/features/admin/presentation/components/admin-traffic-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Users, Calendar, Camera, ShoppingBag } from "lucide-react";

export default async function AdminDashboardPage() {
  const [stats, traffic] = await Promise.all([getAdminStats(), getAnalyticsReport()]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Panel de administración</h1>
      <p className="text-zinc-500">Vista general de la plataforma</p>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Tráfico web</h2>
        <div className="mt-4">
          <AdminTrafficPanel traffic={traffic} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Plataforma</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Totales actuales en la base de datos (no son métricas de visitas).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Usuarios registrados
              </CardDescription>
              <CardTitle className="text-3xl">{stats.users}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Eventos creados
              </CardDescription>
              <CardTitle className="text-3xl">{stats.events}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Camera className="h-4 w-4" /> Fotografías subidas
              </CardDescription>
              <CardTitle className="text-3xl">{stats.photos}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Pedidos pendientes
              </CardDescription>
              <CardTitle className="text-3xl">{stats.pendingRequests}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
