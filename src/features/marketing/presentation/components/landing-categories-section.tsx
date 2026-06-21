import Link from "next/link";
import Image from "next/image";
import type { LandingFeaturedCategory, LandingImages } from "@/config/landing.defaults";
import { routes } from "@/config/routes";
import {
  categoryLayoutClasses,
  isCategoryGrayscale,
  resolveFeaturedCategoryHref,
  resolveFeaturedCategoryImage,
} from "@/shared/lib/landing-category";
import { cn } from "@/shared/lib/utils";

interface LandingCategoriesSectionProps {
  categories: LandingFeaturedCategory[];
  images: LandingImages;
}

export function LandingCategoriesSection({
  categories,
  images,
}: LandingCategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
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
          {categories.map((category) => {
            const layout = categoryLayoutClasses(category.layout);
            const grayscale = isCategoryGrayscale(category, true);

            return (
              <Link
                key={category.id}
                href={resolveFeaturedCategoryHref(category)}
                className={cn(
                  "group relative min-h-[280px] cursor-pointer overflow-hidden md:min-h-0",
                  layout.span,
                )}
              >
                <Image
                  src={resolveFeaturedCategoryImage(category, images)}
                  alt={category.title}
                  fill
                  unoptimized
                  className={cn(
                    "object-cover transition-transform duration-700 group-hover:scale-105",
                    grayscale && "grayscale-filter",
                  )}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-10 left-10">
                  <h4 className={layout.titleClass}>{category.title}</h4>
                  {category.subtitle && (
                    <p className="text-label-sm tracking-widest text-on-surface-variant">
                      {category.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
