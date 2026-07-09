import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { LandingNav } from "@/features/marketing/presentation/components/landing-nav";
import { PublicMobileNav } from "@/shared/components/public-mobile-nav";
import { LandingFooter } from "@/features/marketing/presentation/components/landing-footer";
import { MaterialIcon } from "@/shared/components/icon";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { LandingFadeIn } from "@/features/marketing/presentation/components/landing-fade-in";
import { LandingHowItWorksSection } from "@/features/marketing/presentation/components/landing-how-it-works-section";
import { LandingPhotographerCtaSection } from "@/features/marketing/presentation/components/landing-photographer-cta-section";
import { LandingStatsSection } from "@/features/marketing/presentation/components/landing-stats-section";
import { LandingTestimonialsSection } from "@/features/marketing/presentation/components/landing-testimonials-section";
import { LandingFaqSection } from "@/features/marketing/presentation/components/landing-faq-section";
import { FeaturedEventsSection } from "@/features/marketing/presentation/components/featured-events-section";
import { getLandingSettings } from "@/features/platform/infrastructure/landing-settings.repository";
import {
  getPlatformPublicStats,
  mapPlatformStatsToLanding,
} from "@/features/platform/infrastructure/platform-stats.repository";
import { cn } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  const [settings, platformStats] = await Promise.all([
    getLandingSettings(),
    getPlatformPublicStats(),
  ]);
  const {
    images: IMAGES,
    grayscale: GRAYSCALE,
    featuredEventIds,
    testimonials,
    faq,
  } = settings;
  const stats = mapPlatformStatsToLanding(platformStats);

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
              href={routes.becomePhotographer}
              className="text-label-sm w-full border border-white/30 px-10 py-4 tracking-widest text-primary transition-all hover:bg-white/5 md:w-auto"
            >
              Soy {PHOTOGRAPHER_LABEL.singular}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <MaterialIcon name="expand_more" className="text-white/30" />
        </div>
      </section>

      {/* How it works */}
      <LandingFadeIn>
        <LandingHowItWorksSection />
      </LandingFadeIn>

      {/* Galerías destacadas */}
      {featuredEventIds.length > 0 && (
        <LandingFadeIn>
          <Suspense fallback={null}>
            <FeaturedEventsSection eventIds={featuredEventIds} />
          </Suspense>
        </LandingFadeIn>
      )}

      {/* For photographers */}
      <LandingFadeIn>
        <LandingPhotographerCtaSection
          image={IMAGES.photographer}
          grayscale={GRAYSCALE.photographer}
        />
      </LandingFadeIn>

      {/* Stats */}
      <LandingStatsSection stats={stats} />

      {/* Testimonials */}
      <LandingFadeIn>
        <LandingTestimonialsSection testimonials={testimonials} />
      </LandingFadeIn>

      {/* FAQ */}
      <LandingFadeIn>
        <LandingFaqSection items={faq} />
      </LandingFadeIn>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-black px-margin-mobile py-section-compact md:px-margin-desktop">
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
      <PublicMobileNav />
    </>
  );
}
