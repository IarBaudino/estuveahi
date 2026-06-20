import { notFound } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { getEventById } from "@/features/events/infrastructure/event.repository";
import { getEventPhotos } from "@/features/photos/infrastructure/photo.repository";
import { EventManageClient } from "@/features/events/presentation/components/event-manage-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventManagePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const event = await getEventById(id);

  if (!event || event.photographerId !== session?.user.id) {
    notFound();
  }

  const photos = await getEventPhotos(event.id, 100);

  return <EventManageClient event={event} photos={photos} />;
}
