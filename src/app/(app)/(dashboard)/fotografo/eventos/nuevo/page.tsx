import { EventCreateForm } from "@/features/events/presentation/components/event-create-form";

export default function NewEventPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Nuevo evento</h1>
      <p className="mt-1 text-zinc-500">Crea un evento para subir tus fotografías</p>
      <EventCreateForm mode="photographer" />
    </div>
  );
}
