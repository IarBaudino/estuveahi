import Link from "next/link";
import Image from "next/image";
import type { LandingImages, LandingGrayscale } from "@/config/landing.defaults";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { cn } from "@/shared/lib/utils";

interface LandingPhotographerCtaSectionProps {
  image: LandingImages["photographer"];
  grayscale: LandingGrayscale["photographer"];
}

export function LandingPhotographerCtaSection({
  image,
  grayscale,
}: LandingPhotographerCtaSectionProps) {
  return (
    <section className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-10 px-margin-mobile py-section-compact md:grid-cols-2 md:gap-14 md:px-margin-desktop">
      <div className="order-2 md:order-1">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl hairline-border">
          <Image
            src={image}
            alt={`${PHOTOGRAPHER_LABEL.singularCap} trabajando`}
            fill
            unoptimized
            className={cn("object-cover", grayscale && "grayscale")}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
      <div className="order-1 space-y-6 md:order-2">
        <div>
          <span className="text-label-sm mb-3 block tracking-[0.3em] text-on-surface-variant/50">
            Alianza
          </span>
          <h2 className="text-headline-lg mb-4">
            Un espacio para la mirada profesional.
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            ¿Sos {PHOTOGRAPHER_LABEL.singular}? Sumate y publicá tus galerías de eventos para
            llegar a quien estuvo en la platea.
          </p>
        </div>
        <Link
          href={routes.becomePhotographer}
          className="text-label-sm inline-block bg-primary px-10 py-4 tracking-widest text-background transition-all hover:opacity-90"
        >
          Sumarme como {PHOTOGRAPHER_LABEL.singular}
        </Link>
      </div>
    </section>
  );
}
