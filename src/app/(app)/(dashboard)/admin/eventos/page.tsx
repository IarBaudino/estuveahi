import { getAllEventsForAdmin } from "@/features/events/infrastructure/event.repository";
import { AdminEventsTable } from "@/features/admin/presentation/components/admin-events-table";

export default async function AdminEventsPage() {
  const events = await getAllEventsForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold">Eventos</h1>
      <p className="text-on-surface-variant">Moderación de eventos</p>
      <div className="mt-6">
        <AdminEventsTable events={events} />
      </div>
    </div>
  );
}
