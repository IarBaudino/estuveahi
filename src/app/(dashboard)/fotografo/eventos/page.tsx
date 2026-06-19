import Link from "next/link";
import { auth } from "@/infrastructure/auth";
import { getPhotographerEvents } from "@/features/events/infrastructure/event.repository";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { routes } from "@/config/routes";
import { formatDate } from "@/shared/lib/utils";
import { Plus } from "lucide-react";

export default async function PhotographerEventsPage() {
  const session = await auth();
  const events = await getPhotographerEvents(session!.user.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis eventos</h1>
          <p className="text-zinc-500">{events.length} eventos</p>
        </div>
        <Link href={routes.photographer.newEvent}>
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {events.length === 0 ? (
          <p className="text-zinc-500">No tienes eventos aún.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{event.title}</h3>
                  <Badge variant={event.status === "published" ? "success" : "default"}>
                    {event.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatDate(event.eventDate)} · {event.photoCount} fotos · QR: {event.qrCode}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={routes.photographer.event(event.id)}>
                  <Button variant="outline" size="sm">Gestionar</Button>
                </Link>
                {event.status === "published" && (
                  <Link href={routes.event(event.slug)} target="_blank">
                    <Button variant="ghost" size="sm">Ver público</Button>
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
