import Link from "next/link";
import Image from "next/image";
import type { LandingImageKey, LandingImages } from "@/config/landing.defaults";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { MaterialIcon } from "@/shared/components/icon";
import { cn } from "@/shared/lib/utils";

const STEPS: {
  icon: string;
  step: string;
  title: string;
  text: string;
  imageKey: LandingImageKey;
}[] = [
  {
    icon: "search",
    step: "01",
    title: "Buscá",
    text: "Ingresá el evento, la fecha o el recinto y encontrá tu galería en segundos.",
    imageKey: "festivales",
  },
  {
    icon: "grid_view",
    step: "02",
    title: "Explorá",
    text: `Recorré cientos de fotos profesionales capturadas por ${PHOTOGRAPHER_LABEL.plural} de la escena.`,
    imageKey: "recitales",
  },
  {
    icon: "shopping_bag",
    step: "03",
    title: "Comprá",
    text: `Pedí la foto, acordá el precio con el ${PHOTOGRAPHER_LABEL.singular} y recibila en alta.`,
    imageKey: "teatro",
  },
];

interface LandingHowItWorksSectionProps {
  images: LandingImages;
  grayscale: Record<LandingImageKey, boolean>;
}

export function LandingHowItWorksSection({
  images,
  grayscale,
}: LandingHowItWorksSectionProps) {
  return (
    <section className="mx-auto max-w-container-max px-margin-mobile py-section-compact md:px-margin-desktop">
      <div className="mb-10 flex flex-col items-center text-center md:mb-12">
        <span className="text-label-sm mb-3 tracking-[0.3em] text-on-surface-variant/50">
          Metodología
        </span>
        <h2 className="text-headline-lg max-w-2xl">Cómo funciona EstuveAhí</h2>
        <p className="text-body-md mt-3 max-w-xl text-on-surface-variant">
          Tres pasos para revivir el momento que viviste.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {STEPS.map((step) => (
          <article
            key={step.step}
            className="group relative min-h-[320px] overflow-hidden rounded-xl hairline-border md:min-h-[420px]"
          >
            <Image
              src={images[step.imageKey]}
              alt=""
              fill
              unoptimized
              className={cn(
                "object-cover transition-transform duration-700 group-hover:scale-105",
                grayscale[step.imageKey] && "grayscale",
              )}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-4xl font-bold leading-none text-white/25 md:text-5xl">
                  {step.step}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-sm">
                  <MaterialIcon name={step.icon} className="text-xl text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-headline-md mb-2 text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/75">{step.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
