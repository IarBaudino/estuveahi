import Link from "next/link";
import { getPhotographersForAdmin } from "@/features/events/infrastructure/event.repository";
import { EventCreateForm } from "@/features/events/presentation/components/event-create-form";
import { routes } from "@/config/routes";

export default async function AdminNewEventPage() {
  const photographers = await getPhotographersForAdmin();

  return (
    <div className="max-w-2xl">
      <Link
        href={routes.admin.events}
        className="text-sm text-on-surface-variant hover:text-on-surface"
      >
        ← Volver a eventos
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Nuevo evento</h1>
      <p className="mt-1 text-on-surface-variant">
        Creá un evento y asignalo a un fotógrafo
      </p>
      <EventCreateForm mode="admin" photographers={photographers} />
    </div>
  );
}
