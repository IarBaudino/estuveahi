import { revalidatePath } from "next/cache";
import { EventStatus } from "@/domain/enums/event-status";
import { routes } from "@/config/routes";

type EventRevalidateTarget = {
  id: string;
  slug: string;
  status: string;
  isPublic?: boolean;
};

/** Solo galería pública — seguro tras subir fotos sin refrescar el panel. */
export function revalidatePublicEventPath(event: EventRevalidateTarget) {
  if (event.status === EventStatus.PUBLISHED && event.isPublic !== false) {
    revalidatePath(routes.event(event.slug));
  }
}

/** Tras publicar, archivar o editar metadata del evento. */
export function revalidateEventPaths(event: EventRevalidateTarget) {
  revalidatePublicEventPath(event);
  revalidatePath(routes.photographer.event(event.id));
  revalidatePath(routes.admin.event(event.id));
  revalidatePath(routes.photographer.events);
  revalidatePath(routes.admin.events);
}
