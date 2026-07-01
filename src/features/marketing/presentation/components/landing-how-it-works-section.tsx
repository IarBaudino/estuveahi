import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { MaterialIcon } from "@/shared/components/icon";
import { cn } from "@/shared/lib/utils";

const STEPS = [
  {
    icon: "search",
    step: "01",
    title: "Buscá",
    text: "Ingresá el evento, la fecha o el recinto y encontrá tu galería en segundos.",
  },
  {
    icon: "grid_view",
    step: "02",
    title: "Explorá",
    text: `Recorré cientos de fotos profesionales capturadas por ${PHOTOGRAPHER_LABEL.plural} de la escena.`,
  },
  {
    icon: "shopping_bag",
    step: "03",
    title: "Comprá",
    text: `Pedí la foto, acordá el precio con el ${PHOTOGRAPHER_LABEL.singular} y recibila en alta.`,
  },
] as const;

export function LandingHowItWorksSection() {
  return (
    <section className="mx-auto max-w-container-max px-margin-mobile py-section-compact md:px-margin-desktop">
      <div className="mb-8 flex flex-col items-center text-center md:mb-10">
        <span className="text-label-sm mb-3 tracking-[0.3em] text-on-surface-variant/50">
          Metodología
        </span>
        <h2 className="text-headline-lg max-w-2xl">Cómo funciona EstuveAhí</h2>
        <p className="text-body-md mt-2 max-w-xl text-on-surface-variant">
          Tres pasos para revivir el momento que viviste.
        </p>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {STEPS.map((step) => (
          <article
            key={step.step}
            className={cn(
              "group flex items-center gap-4 rounded-lg border px-4 py-3.5 transition-colors md:gap-5 md:px-5 md:py-4",
              "border-[#4a4743]/50 bg-[#2c2a27] hover:border-[#5c5853]/70 hover:bg-[#332f2c]",
            )}
          >
            <span className="w-6 shrink-0 font-mono text-xs tracking-wider text-[#8a8580]">
              {step.step}
            </span>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3a3734] ring-1 ring-[#524f4b]/60">
              <MaterialIcon name={step.icon} className="text-lg text-[#d4cfc8]" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold tracking-wide text-[#ebe8e4] md:text-base">
                {step.title}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-[#a8a39c] md:text-sm">
                {step.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
