import Link from "next/link";
import Image from "next/image";
import type { LandingCopy, LandingImages, LandingGrayscale } from "@/config/landing.defaults";
import { routes } from "@/config/routes";
import { cn } from "@/shared/lib/utils";

interface LandingPhotographerCtaSectionProps {
  image: LandingImages["photographer"];
  grayscale: LandingGrayscale["photographer"];
  copy: Pick<
    LandingCopy,
    "photographerEyebrow" | "photographerTitle" | "photographerBody" | "photographerCta"
  >;
}

export function LandingPhotographerCtaSection({
  image,
  grayscale,
  copy,
}: LandingPhotographerCtaSectionProps) {
  return (
    <section className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-10 px-margin-mobile py-section-compact md:grid-cols-2 md:gap-14 md:px-margin-desktop">
      <div className="order-2 md:order-1">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl hairline-border">
          <Image
            src={image}
            alt={copy.photographerTitle}
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
            {copy.photographerEyebrow}
          </span>
          <h2 className="text-headline-lg mb-4">{copy.photographerTitle}</h2>
          <p className="text-body-lg text-on-surface-variant">{copy.photographerBody}</p>
        </div>
        <Link
          href={routes.becomePhotographer}
          className="text-label-sm inline-block bg-primary px-10 py-4 tracking-widest text-background transition-all hover:opacity-90"
        >
          {copy.photographerCta}
        </Link>
      </div>
    </section>
  );
}
