import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/features/events/infrastructure/event.repository";
import { getEventPhotos } from "@/features/photos/infrastructure/photo-read.repository";
import { EventManageClient } from "@/features/events/presentation/components/event-manage-client";
import { routes } from "@/config/routes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventManagePage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const photos = await getEventPhotos(event.id, 100);

  return (
    <div>
      <Link
        href={routes.admin.events}
        className="text-sm text-on-surface-variant hover:text-on-surface"
      >
        ← Volver a eventos
      </Link>
      <div className="mt-4">
        <EventManageClient event={event} photos={photos} />
      </div>
    </div>
  );
}
