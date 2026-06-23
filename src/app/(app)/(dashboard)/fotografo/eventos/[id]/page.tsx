import { notFound } from "next/navigation";
import { getServerSessionUser } from "@/infrastructure/auth/session";
import { getEventById } from "@/features/events/infrastructure/event.repository";
import { getEventPhotos } from "@/features/photos/infrastructure/photo-read.repository";
import { EventManageClient } from "@/features/events/presentation/components/event-manage-client";
import {
  canManageEvent,
  canViewEventPanel,
  canContributeToEvent,
} from "@/features/events/infrastructure/event-access";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function EventManagePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getServerSessionUser();
  const event = await getEventById(id);

  if (!event || !user || !canViewEventPanel(event, user.id, user.role)) {
    notFound();
  }

  const photos = await getEventPhotos(event.id, 100);
  const isOwner = canManageEvent(event, user.id, user.role);
  const canUpload = canContributeToEvent(event, user.id, user.role);

  return (
    <EventManageClient
      event={event}
      photos={photos}
      isOwner={isOwner}
      canUpload={canUpload}
      currentUserId={user.id}
    />
  );
}
