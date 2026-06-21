import { getLandingSettingsForAdmin } from "@/features/platform/infrastructure/landing-settings.repository";
import { getPublishedEventsForPicker } from "@/features/events/infrastructure/event.repository";
import { AdminLandingManager } from "@/features/admin/presentation/components/admin-landing-manager";
import { AdminFeaturedCategories } from "@/features/admin/presentation/components/admin-featured-categories";
import { AdminFeaturedEvents } from "@/features/admin/presentation/components/admin-featured-events";

export default async function AdminContentPage() {
  const [settings, publishedEvents] = await Promise.all([
    getLandingSettingsForAdmin(),
    getPublishedEventsForPicker(),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold">Contenido de la home</h1>
        <p className="mt-1 text-on-surface-variant">
          Configurá categorías, eventos destacados e imágenes de la página principal.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Categorías destacadas</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Bloques del grid en la home. Podés agregar nuevas, cambiar textos, links e imágenes.
        </p>
        <div className="mt-6">
          <AdminFeaturedCategories
            categories={settings.featuredCategories}
            images={settings.images}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Eventos destacados</h2>
        <div className="mt-6">
          <AdminFeaturedEvents
            publishedEvents={publishedEvents}
            selectedEventIds={settings.featuredEventIds}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Imágenes fijas de la home</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Hero, sección fotografx, CTA y respaldos legacy de categorías.
        </p>
        <div className="mt-6">
          <AdminLandingManager images={settings.images} grayscale={settings.grayscale} />
        </div>
      </section>
    </div>
  );
}
