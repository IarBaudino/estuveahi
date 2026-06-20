import Link from "next/link";
import { getAllEventsForAdmin } from "@/features/events/infrastructure/event.repository";
import { AdminEventsTable } from "@/features/admin/presentation/components/admin-events-table";
import { Button } from "@/shared/ui/button";
import { routes } from "@/config/routes";

export default async function AdminEventsPage() {
  const events = await getAllEventsForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-on-surface-variant">Moderación y gestión de eventos</p>
        </div>
        <Link href={routes.admin.newEvent}>
          <Button>Crear evento</Button>
        </Link>
      </div>
      <div className="mt-6">
        <AdminEventsTable events={events} />
      </div>
    </div>
  );
}
