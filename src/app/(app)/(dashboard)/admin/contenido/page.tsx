import { getLandingSettingsForAdmin } from "@/features/platform/infrastructure/landing-settings.repository";
import { AdminLandingManager } from "@/features/admin/presentation/components/admin-landing-manager";
import { AdminLandingCopy } from "@/features/admin/presentation/components/admin-landing-copy";
import { AdminLandingTestimonials } from "@/features/admin/presentation/components/admin-landing-testimonials";
import { AdminLandingFaq } from "@/features/admin/presentation/components/admin-landing-faq";

export default async function AdminContentPage() {
  const settings = await getLandingSettingsForAdmin();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold">Contenido de la home</h1>
        <p className="mt-1 text-on-surface-variant">
          Editá textos, imágenes, encuadre del hero, opiniones y preguntas frecuentes.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Textos</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Hero, sección de fotografxs y llamada a la acción final.
        </p>
        <div className="mt-6">
          <AdminLandingCopy copy={settings.copy} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Imágenes</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Hero, sección fotografx y CTA final. Podés acomodar el encuadre del hero si queda
          cortado.
        </p>
        <div className="mt-6">
          <AdminLandingManager
            images={settings.images}
            grayscale={settings.grayscale}
            heroFocus={settings.heroFocus}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Opiniones</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Testimonios de la sección &ldquo;En palabras de la comunidad&rdquo;.
        </p>
        <div className="mt-6">
          <AdminLandingTestimonials testimonials={settings.testimonials} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Preguntas frecuentes</h2>
        <div className="mt-6">
          <AdminLandingFaq items={settings.faq} />
        </div>
      </section>
    </div>
  );
}
