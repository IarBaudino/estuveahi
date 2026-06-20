import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { LandingNav } from "@/features/marketing/presentation/components/landing-nav";
import { LandingFooter } from "@/features/marketing/presentation/components/landing-footer";
import { RecentEventsSection } from "@/features/marketing/presentation/components/recent-events-section";
import { MaterialIcon } from "@/shared/components/icon";
import { routes } from "@/config/routes";
import { LandingFadeIn } from "@/features/marketing/presentation/components/landing-fade-in";

const IMAGES = {
  hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuBj8-NIDsvIc5_94Ha-x7LzHsNh1LihHHqv-wFpJ72UmdcbSTzp0trQVvHRQYEA-dHOxpGOC6BfmPLatFDecBejxIs-dPGmwiyMEDTBiqYMZejt3StocqWf-p8esuguN99f3bDOmkv-tMqj3R1pgVBHvUY1dHW_D2T4xLFAgLjKA4fu2reOsxxce6vPTUs7OgC0FByFRRk_cwR4y_Mk1KLTVh7gVJYnfo3nOSjae0MG0v1kJmIKairhBgqEvIcoV13QlSehGCoPgqc",
  festivales:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAuglOv-XqARjIRYWSUPg-g-UDYxleA3hyI-kvEC5XAZyXSouMjaOTDOgmAwRm171bkc7eKDP_JuKN8kKiXiXEK_8j0ruTOHWwy_QliesHN-ShHDIhUkmU_C4t4ZiV1iXHCPamLkatrHHESaJSgVFqZRnwVoCK_0x-yXSyzdg4GexizSF1f8TSs25jeF8Ax5oJFYbpkQxqGXSl0ao-y6_iOtlG_cEYvGmgBOGKwwdhFChN8--TrXKxekwrj-s63kGYILQGdu7W7QY8",
  recitales:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB_0XxR4yszB3Zh9ylkNPDSyyFLF-ZbXcP3XK8KS5jbpxsUJzeNhD2tWcrlvmoTcFZ6OuGw4TaSJ59mH_wpOMx078zS5ichf6o0_N5NiDspHe5W3ERwv9RmK-JaGnGHLtH56Q2H-qDSpiwfN9l5TztbWKFSps1GZYTwkGlepkrZiw9qrIWGgnEd9R1kg_L-Cp8i_T3s4zAhbZ_8plfSNNooXutPbSRAzfI1ElgOMi_Uqp6BObMBPZZGcraxr9yziajdH4b6Wab95Vw",
  teatro:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDEam1_bbLpRd_SvWAkxbw-xPt4bDOMZR0R-I7bZ7044AF_6UIFrn9_z7dcCO3PKEQDsCwCCy-3hQBDjQ3XDzGOkrmFK0AOyc8mf4EijUagMb9XYqA1M4OJamGid_EeWJzkDBxii6xyFwg_-0AkLMAvEWu_t_-uhzr-r76fMgRlyFDcbOz_atb-SFYOTyzZCMcMaLlpgJ4KsI1b5OIeTf5yKgBd4y2XObl9okFntmTjVYAzlpMNPE-FZm9eIq9vMi5Y1tUkxVetJk4",
  deportes:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuALqYKWz-9cxaGmjY7ktbLASQ-bqihtQ9v0Pe_dwq2QqCvBkBmRk9sgju88gQPoIPeVHDlPvvGuNdhpx3RinFWmgmQ-88862j1WPOoYFzVC7BQSR99P8RNmIkLmp23pdr8PjfqgKwpG7TCA2MOlqRUB6jf8Ow93bMfkAUD3OwT8nNnAX3Gz1b9k9NtqgSFbFGADfWuLz43GZYFG6dJ5Dn1YAnxHQ680myQFIrCG1so3wrd3ah2KbK68lY0TP52WPl-Wh6O37lhBvIk",
  photographer:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD9xVq9mJZwUXJGzTsArBj_J4j4M7QquTepuolMz2Lf-37D2cuXrduf_IT02vmC4OweXmk7jRX15mvnEOTVkSKNK_JVfFABukUHp8HyND4kPZfQ46y-IvBxKNlzQe0VDuxDD6x_3nmvE1DMJXh2_zoYV8h8SAhyOT9W89k1aNS_ZRUQ3zQNk4fijMtqHYQ-b0JC0SUAdQPElqQXKj3wLkFPq_9hT56QzFVAjhyXKSl_05uIpDHpyPeUqxzxCFiG3Us0Nqs3P_BEtw0",
  cta: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZANIVI6l5drZpiWnyCseWWjXb6l7J6_xo_iNB5u89J15ZJOyXS_5SFyLOOq39M9YxOfvCxmInhg55up_Nwy25JnNxIWzO70_5tio2Vy-3Ft7Ks81-tE-H-xD_C4qtNTYnCH2rElMZeDIl3W7_ueDTOgaA2BEg2pOea5y9z4bMud4enfGUa9T842qeRu1oiaG_vwXjuTTDTkqg5BffGolZDlptIg9fdzGat1kzcq4rd9GKMKD5SnFHcqs6rGxaTMcfLrHmgIZYf4E",
};

const CATEGORIES = [
  {
    title: "Festivales",
    subtitle: "248 galerías activas",
    image: IMAGES.festivales,
    href: `${routes.events}?category=festival`,
    span: "md:col-span-8",
    titleClass: "text-headline-lg",
  },
  {
    title: "Recitales",
    subtitle: "Boutique & Arena",
    image: IMAGES.recitales,
    href: `${routes.events}?category=concert`,
    span: "md:col-span-4",
    titleClass: "text-headline-md",
  },
  {
    title: "Teatro",
    subtitle: "Obras & Musicales",
    image: IMAGES.teatro,
    href: `${routes.events}?category=theater`,
    span: "md:col-span-4",
    titleClass: "text-headline-md",
  },
  {
    title: "Deportes",
    subtitle: "Fútbol, Tenis & más",
    image: IMAGES.deportes,
    href: `${routes.events}?category=sports`,
    span: "md:col-span-8",
    titleClass: "text-headline-lg",
  },
];

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
export const fetchCache = "force-no-store";

export default function HomePage() {
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
            className="object-cover opacity-60 grayscale"
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
                    className="grayscale-filter object-cover transition-transform duration-700 group-hover:scale-105"
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

      {/* Recent events from DB */}
      <Suspense fallback={null}>
        <RecentEventsSection />
      </Suspense>

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
                className="object-cover grayscale"
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
          <Image src={IMAGES.cta} alt="" fill unoptimized className="object-cover grayscale" sizes="100vw" />
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
