import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/infrastructure/auth/session";
import {
  getPhotographerApplicationStatus,
  getPhotographerProfile,
} from "@/features/auth/infrastructure/auth.repository";
import { getPhotographerEvents } from "@/features/events/infrastructure/event.repository";
import { getPendingRequestCount } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { getPhotographerPhotoCount } from "@/features/photos/infrastructure/photo-read.repository";
import { PhotographerPendingReview } from "@/features/auth/presentation/components/photographer-pending-review";
import { PhotographerPanelGuide } from "@/features/auth/presentation/components/photographer-panel-guide";
import { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Calendar, Camera, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

export const dynamic = "force-dynamic";

export default async function PhotographerDashboardPage() {
  const user = await getServerSessionUser();
  if (!user) redirect(routes.login);

  if (user.role === "client") {
    try {
      const status = await getPhotographerApplicationStatus(user.id);
      if (status === PhotographerApplicationStatus.PENDING) {
        return <PhotographerPendingReview />;
      }
    } catch (error) {
      console.error("[PhotographerDashboard] application status:", error);
    }
  }

  let events: Awaited<ReturnType<typeof getPhotographerEvents>> = [];
  let pendingRequests = 0;
  let photoCount = 0;
  let isVerified = false;

  try {
    const [eventsResult, pendingResult, photoResult, profile] = await Promise.all([
      getPhotographerEvents(user.id),
      getPendingRequestCount(user.id),
      getPhotographerPhotoCount(user.id),
      getPhotographerProfile(user.id),
    ]);
    events = eventsResult;
    pendingRequests = pendingResult;
    photoCount = photoResult;
    isVerified = profile?.isVerified === true;
  } catch (error) {
    console.error("[PhotographerDashboard] data load failed:", error);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{PHOTOGRAPHER_LABEL.panel}</h1>
          <p className="text-on-surface-variant">Resumen de tu actividad</p>
        </div>
        <Link href={routes.photographer.newEvent}>
          <Button>Nuevo evento</Button>
        </Link>
      </div>

      <PhotographerPanelGuide isVerified={isVerified} className="mt-8" />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
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

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Eventos recientes</h2>
        {events.length === 0 ? (
          <p className="mt-4 text-on-surface-variant">
            Aún no tenés eventos. ¡Creá el primero!
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {events.slice(0, 5).map((event) => {
              const isOwn = event.photographerId === user.id;
              return (
                <li key={event.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-on-surface-variant">
                      {event.photoCount} fotos · {event.status}
                      {!isOwn && " · colaborativo"}
                    </p>
                  </div>
                  <Link href={routes.photographer.event(event.id)}>
                    <Button variant="outline" size="sm">
                      {isOwn ? "Gestionar" : "Colaborar"}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
