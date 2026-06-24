import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSessionUser } from "@/infrastructure/auth/session";
import { getEventById } from "@/features/events/infrastructure/event.repository";
import { getEventPhotos } from "@/features/photos/infrastructure/photo-read.repository";
import { EventManageClient } from "@/features/events/presentation/components/event-manage-client";
import { canContributeToEvent } from "@/features/events/infrastructure/event-access";
import { routes } from "@/config/routes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventManagePage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);
  const user = await getServerSessionUser();

  if (!event || !user) {
    notFound();
  }

  const photos = await getEventPhotos(event.id);

  return (
    <div>
      <Link
        href={routes.admin.events}
        className="text-sm text-on-surface-variant hover:text-on-surface"
      >
        ← Volver a eventos
      </Link>
      <div className="mt-4">
        <EventManageClient
          event={event}
          photos={photos}
          isOwner
          canUpload={canContributeToEvent(event, user.id, user.role)}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
