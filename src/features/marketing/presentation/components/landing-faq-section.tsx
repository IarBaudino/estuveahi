import { MaterialIcon } from "@/shared/components/icon";
import type { LandingFaqItem } from "@/config/landing.defaults";

interface LandingFaqSectionProps {
  items: LandingFaqItem[];
}

export function LandingFaqSection({ items }: LandingFaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-margin-mobile py-section-compact md:px-margin-desktop">
      <div className="mb-10 text-center">
        <h2 className="text-headline-lg">Preguntas Frecuentes</h2>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <details
            key={item.id}
            className="group cursor-pointer hairline-border p-6 transition-all duration-300 open:bg-white/5"
          >
            <summary className="flex items-center justify-between font-headline-md text-lg">
              {item.question}
              <MaterialIcon
                name="expand_more"
                className="transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="mt-6 leading-relaxed text-on-surface-variant">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
