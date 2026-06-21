import { revalidatePath } from "next/cache";
import { EventStatus } from "@/domain/enums/event-status";
import { routes } from "@/config/routes";

type EventRevalidateTarget = {
  id: string;
  slug: string;
  status: string;
  isPublic?: boolean;
};

export function revalidateEventPaths(event: EventRevalidateTarget) {
  revalidatePath(routes.photographer.event(event.id));
  revalidatePath(routes.admin.event(event.id));
  revalidatePath(routes.photographer.events);
  revalidatePath(routes.admin.events);

  if (event.status === EventStatus.PUBLISHED && event.isPublic !== false) {
    revalidatePath(routes.event(event.slug));
  }
}
