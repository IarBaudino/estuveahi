import Image from "next/image";
import type { LandingTestimonial } from "@/config/landing.defaults";

interface LandingTestimonialsSectionProps {
  testimonials: LandingTestimonial[];
}

export function LandingTestimonialsSection({ testimonials }: LandingTestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-container-max overflow-hidden px-margin-mobile py-section-compact md:px-margin-desktop">
      <div className="mb-10 flex flex-col items-center md:mb-12">
        <span className="text-label-sm mb-4 tracking-[0.3em] text-on-surface-variant/50">
          Opiniones
        </span>
        <h2 className="text-headline-lg text-center">En palabras de la comunidad</h2>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="space-y-8 bg-white/5 p-12 hairline-border">
            <p className="text-headline-md italic leading-relaxed text-primary">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="flex items-center gap-4">
              {testimonial.avatarUrl ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.avatarUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-full bg-surface-container-high" />
              )}
              <div>
                <p className="text-label-sm tracking-wider">{testimonial.name}</p>
                <p className="text-caption text-on-surface-variant">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
