import { EventCreateForm } from "@/features/events/presentation/components/event-create-form";

export default function NewEventPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Nuevo evento</h1>
      <p className="mt-1 text-on-surface-variant">
        Creá el evento con fecha de hoy o de ayer. Podés publicarlo sin fotos para avisar en la home.
      </p>
      <EventCreateForm mode="photographer" />
    </div>
  );
}
