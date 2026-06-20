import { getAdminStats } from "@/features/events/infrastructure/event.repository";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Users, Calendar, Camera, ShoppingBag } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-bold">Panel de administración</h1>
      <p className="text-zinc-500">Vista general de la plataforma</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
  );
}
