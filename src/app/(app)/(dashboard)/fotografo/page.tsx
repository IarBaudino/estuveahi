import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { getPhotographerApplicationStatus } from "@/features/auth/infrastructure/auth.repository";
import { getPhotographerEvents } from "@/features/events/infrastructure/event.repository";
import { getPendingRequestCount } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { getPhotographerPhotoCount } from "@/features/photos/infrastructure/photo.repository";
import { PhotographerPendingReview } from "@/features/auth/presentation/components/photographer-pending-review";
import { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Calendar, Camera, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { Button } from "@/shared/ui/button";

export default async function PhotographerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  if (session.user.role === "client") {
    const status = await getPhotographerApplicationStatus(session.user.id);
    if (status === PhotographerApplicationStatus.PENDING) {
      return <PhotographerPendingReview />;
    }
  }

  const userId = session.user.id;

  let events: Awaited<ReturnType<typeof getPhotographerEvents>> = [];
  let pendingRequests = 0;
  let photoCount = 0;

  try {
    [events, pendingRequests, photoCount] = await Promise.all([
      getPhotographerEvents(userId),
      getPendingRequestCount(userId),
      getPhotographerPhotoCount(userId),
    ]);
  } catch (error) {
    console.error("[PhotographerDashboard] data load failed:", error);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-500">Resumen de tu actividad</p>
        </div>
        <Link href={routes.photographer.newEvent}>
          <Button>Nuevo evento</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Eventos
            </CardDescription>
            <CardTitle className="text-3xl">{events.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Camera className="h-4 w-4" /> Fotografías
            </CardDescription>
            <CardTitle className="text-3xl">{photoCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Solicitudes pendientes
            </CardDescription>
            <CardTitle className="text-3xl">{pendingRequests}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Eventos recientes</h2>
        {events.length === 0 ? (
          <p className="mt-4 text-zinc-500">Aún no tienes eventos. ¡Crea el primero!</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {events.slice(0, 5).map((event) => (
              <li key={event.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-zinc-500">
                    {event.photoCount} fotos · {event.status}
                  </p>
                </div>
                <Link href={routes.photographer.event(event.id)}>
                  <Button variant="outline" size="sm">Gestionar</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
