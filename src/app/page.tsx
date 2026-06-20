import Link from "next/link";
import Image from "next/image";
import { LandingNav } from "@/features/marketing/presentation/components/landing-nav";
import { LandingFooter } from "@/features/marketing/presentation/components/landing-footer";
import { MaterialIcon } from "@/shared/components/icon";
import { routes } from "@/config/routes";
import { LandingFadeIn } from "@/features/marketing/presentation/components/landing-fade-in";
import { getLandingSettings } from "@/features/platform/infrastructure/landing-settings.repository";
import type { LandingImages } from "@/config/landing.defaults";
import { cn } from "@/shared/lib/utils";

function buildCategories(images: LandingImages) {
  return [
    {
      key: "festivales" as const,
      title: "Festivales",
      subtitle: "248 galerías activas",
      image: images.festivales,
      href: `${routes.events}?category=festival`,
      span: "md:col-span-8",
      titleClass: "text-headline-lg",
    },
    {
      key: "recitales" as const,
      title: "Recitales",
      subtitle: "Boutique & Arena",
      image: images.recitales,
      href: `${routes.events}?category=concert`,
      span: "md:col-span-4",
      titleClass: "text-headline-md",
    },
    {
      key: "teatro" as const,
      title: "Teatro",
      subtitle: "Obras & Musicales",
      image: images.teatro,
      href: `${routes.events}?category=theater`,
      span: "md:col-span-4",
      titleClass: "text-headline-md",
    },
    {
      key: "deportes" as const,
      title: "Deportes",
      subtitle: "Fútbol, Tenis & más",
      image: images.deportes,
      href: `${routes.events}?category=sports`,
      span: "md:col-span-8",
      titleClass: "text-headline-lg",
    },
  ];
}

const FAQ = [
  {
    q: "¿Cómo busco mis fotos?",
    a: "Solo necesitás ingresar a nuestra sección de búsqueda y filtrar por el nombre del evento, la fecha o el lugar. Si el evento fue reciente, aparecerá en la página principal como destacado.",
  },
  {
    q: "¿En qué formato recibo los archivos?",
    a: "El fotógrafo te envía la imagen en alta resolución (JPEG u otro formato acordado) directamente, sin marca de agua, una vez confirmado el pago entre ustedes.",
  },
  {
    q: "¿EstuveAhí se queda con una comisión?",
    a: "No. En esta etapa la plataforma no cobra comisión por venta: el 100 % del acuerdo es para el fotógrafo. Vos pagás directamente a quien tomó la foto.",
  },
  {
    q: "¿Soy fotógrafo, cómo puedo publicar?",
    a: 'Hacé clic en "Soy fotógrafo", completá tu perfil y empezá a subir tus galerías de eventos.',
  },
];

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  const { images: IMAGES, grayscale: GRAYSCALE } = await getLandingSettings();
  const CATEGORIES = buildCategories(IMAGES);

  return (
    <>
      <LandingNav />

      {/* Hero */}
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={IMAGES.hero}
            alt="Multitud en un recital"
            fill
            priority
            unoptimized
            className={cn("object-cover opacity-60", GRAYSCALE.hero && "grayscale")}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 cinematic-overlay" />
        </div>

        <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile text-center md:px-margin-desktop">
          <h1 className="text-display-xl mb-6 leading-none">
            Estuviste ahí.
            <br />
            Nosotros lo capturamos.
          </h1>
          <p className="text-body-lg mx-auto mb-12 max-w-2xl text-on-surface-variant">
            Encontrá las fotografías de los momentos que viviste en recitales, festivales,
            obras y eventos de la mano de profesionales.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            <Link
              href={routes.events}
              className="text-label-sm w-full bg-primary px-10 py-4 tracking-widest text-background transition-all hover:opacity-90 md:w-auto"
            >
              Explorar eventos
            </Link>
            <Link
              href={routes.register}
              className="text-label-sm w-full border border-white/30 px-10 py-4 tracking-widest text-primary transition-all hover:bg-white/5 md:w-auto"
            >
              Soy fotógrafo
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <MaterialIcon name="expand_more" className="text-white/30" />
        </div>
      </section>

      {/* How it works */}
      <LandingFadeIn>
        <section className="mx-auto max-w-container-max px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="mb-24 flex flex-col items-center">
            <span className="text-label-sm mb-4 tracking-[0.3em] text-on-surface-variant/50">
              Metodología
            </span>
            <h2 className="text-headline-lg text-center">Cómo funciona EstuveAhí</h2>
          </div>
          <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
            {[
              { icon: "search", title: "Buscá", text: "Ingresá el nombre del evento, la fecha o el recinto para localizar tu galería personalizada." },
              { icon: "grid_view", title: "Explorá", text: "Navegá entre cientos de tomas profesionales capturadas por los mejores fotógrafos de la escena." },
              { icon: "shopping_bag", title: "Comprá", text: "Solicitá la foto, acordá el precio con el fotógrafo y recibí el archivo en alta directamente de quien la capturó." },
            ].map((step) => (
              <div key={step.title} className="group flex flex-col items-center space-y-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full hairline-border transition-colors duration-500 group-hover:bg-white/5">
                  <MaterialIcon name={step.icon} className="text-3xl" />
                </div>
                <h3 className="text-headline-md">{step.title}</h3>
                <p className="leading-relaxed text-on-surface-variant">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </LandingFadeIn>

      {/* Categories grid */}
      <LandingFadeIn>
        <section className="bg-surface-container-lowest px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="mx-auto max-w-container-max">
            <div className="mb-16 flex items-end justify-between">
              <div>
                <span className="text-label-sm mb-4 block tracking-[0.3em] text-on-surface-variant/50">
                  Catálogo
                </span>
                <h2 className="text-headline-lg">Categorías Destacadas</h2>
              </div>
              <Link
                href={routes.events}
                className="text-label-sm hidden border-b border-white/20 pb-1 tracking-widest transition-all hover:border-white md:block"
              >
                Ver todo el archivo
              </Link>
            </div>

            <div className="grid h-auto grid-cols-1 gap-6 md:h-[800px] md:grid-cols-12">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className={`group relative min-h-[280px] cursor-pointer overflow-hidden md:min-h-0 ${cat.span}`}
                >
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    unoptimized
                    className={cn(
                      "object-cover transition-transform duration-700 group-hover:scale-105",
                      GRAYSCALE[cat.key] && "grayscale-filter",
                    )}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-10 left-10">
                    <h4 className={cat.titleClass}>{cat.title}</h4>
                    <p className="text-label-sm tracking-widest text-on-surface-variant">
                      {cat.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </LandingFadeIn>

      {/* Recent events from DB — desactivado: EventCard async rompe SSR en Vercel */}
      {/* <Suspense fallback={null}>
        <RecentEventsSection />
      </Suspense> */}

      {/* For photographers */}
      <LandingFadeIn>
        <section className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-24 px-margin-mobile py-section-gap md:grid-cols-2 md:px-margin-desktop">
          <div className="order-2 md:order-1">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg hairline-border">
              <Image
                src={IMAGES.photographer}
                alt="Fotógrafo trabajando"
                fill
                unoptimized
                className={cn("object-cover", GRAYSCALE.photographer && "grayscale")}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className="order-1 space-y-12 md:order-2">
            <div>
              <span className="text-label-sm mb-4 block tracking-[0.3em] text-on-surface-variant/50">
                Alianza
              </span>
              <h2 className="text-headline-lg mb-8">
                Un espacio para la mirada profesional.
              </h2>
              <p className="text-body-lg text-on-surface-variant">
                Convertí tu pasión en un negocio escalable. Brindamos la infraestructura
                tecnológica para que solo te preocupes por el encuadre.
              </p>
            </div>
            <div className="space-y-8">
              {[
                { icon: "cloud_upload", title: "Publicá galerías profesionales", text: "Subida masiva y gestión inteligente de archivos pesados en la nube." },
                { icon: "event_note", title: "Gestioná eventos", text: "Calendario de coberturas y acreditaciones centralizado en un solo lugar." },
                { icon: "payments", title: "Vendé tus fotografías", text: "Cobrá el 100 % de cada venta. Vos coordinás el pago y enviás la imagen en alta a tu cliente." },
              ].map((item) => (
                <div key={item.title} className="flex gap-6">
                  <MaterialIcon name={item.icon} className="shrink-0 text-primary" />
                  <div>
                    <h4 className="text-label-sm mb-2 tracking-widest">{item.title}</h4>
                    <p className="text-on-surface-variant/70">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href={routes.register}
              className="text-label-sm inline-block bg-primary px-10 py-4 tracking-widest text-background transition-all hover:opacity-90"
            >
              Sumarme como fotógrafo
            </Link>
          </div>
        </section>
      </LandingFadeIn>

      {/* Stats */}
      <section className="border-y border-white/5 bg-surface-container-low py-24">
        <div className="mx-auto grid max-w-container-max grid-cols-2 gap-12 px-margin-mobile text-center md:grid-cols-4 md:px-margin-desktop">
          {[
            { value: "450k", label: "Fotos capturadas" },
            { value: "1.2k", label: "Eventos anuales" },
            { value: "350", label: "Fotógrafos pro" },
            { value: "15k", label: "Usuarios felices" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-headline-lg mb-2 font-bold md:text-[40px]">{stat.value}</p>
              <p className="text-label-sm tracking-widest text-on-surface-variant/50">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <LandingFadeIn>
        <section className="mx-auto max-w-container-max overflow-hidden px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="mb-24 flex flex-col items-center">
            <span className="text-label-sm mb-4 tracking-[0.3em] text-on-surface-variant/50">
              Opiniones
            </span>
            <h2 className="text-headline-lg text-center">En palabras de la comunidad</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              { quote: "Encontrar la foto exacta de mi primer Luna Park con una calidad increíble fue algo que no esperaba. EstuveAhí capturó la emoción que sentí esa noche.", name: "Mariana V.", role: "Asistente a eventos" },
              { quote: "Como fotógrafo documental, esta plataforma me permite llegar a quienes realmente aprecian mi trabajo y monetizar cada disparo sin complicaciones técnicas.", name: "Julián R.", role: "Fotógrafo Profesional" },
            ].map((t) => (
              <div key={t.name} className="space-y-8 bg-white/5 p-12 hairline-border">
                <p className="text-headline-md italic leading-relaxed text-primary">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-surface-container-high" />
                  <div>
                    <p className="text-label-sm tracking-wider">{t.name}</p>
                    <p className="text-caption text-on-surface-variant">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </LandingFadeIn>

      {/* FAQ */}
      <LandingFadeIn>
        <section className="mx-auto max-w-4xl px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="mb-16 text-center">
            <h2 className="text-headline-lg">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group cursor-pointer hairline-border p-6 transition-all duration-300 open:bg-white/5"
              >
                <summary className="flex items-center justify-between font-headline-md text-lg">
                  {item.q}
                  <MaterialIcon
                    name="expand_more"
                    className="transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="mt-6 leading-relaxed text-on-surface-variant">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      </LandingFadeIn>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-black px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src={IMAGES.cta}
            alt=""
            fill
            unoptimized
            className={cn("object-cover", GRAYSCALE.cta && "grayscale")}
            sizes="100vw"
          />
          <div className="absolute inset-0 cinematic-overlay" />
        </div>
        <div className="relative z-10 mx-auto max-w-container-max space-y-12 text-center">
          <h2 className="text-display-xl leading-tight md:text-[72px]">
            Reviví los momentos que
            <br />
            merecen ser recordados.
          </h2>
          <Link
            href={routes.events}
            className="text-label-sm inline-block bg-primary px-12 py-5 tracking-[0.2em] text-background transition-transform duration-300 hover:scale-105"
          >
            Explorar eventos ahora
          </Link>
        </div>
      </section>

      <LandingFooter />
    </>
  );
}
