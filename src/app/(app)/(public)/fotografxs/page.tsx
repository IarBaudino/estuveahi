import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { searchPublicPhotographers } from "@/features/photographers/infrastructure/photographer.repository";
import { BadgeCheck } from "lucide-react";

export const metadata: Metadata = {
  title: `${PHOTOGRAPHER_LABEL.pluralCap} en EstuveAhí`,
  description: `Conocé a lxs ${PHOTOGRAPHER_LABEL.plural} que publican galerías de eventos en EstuveAhí.`,
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function PhotographersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { photographers, total } = await searchPublicPhotographers({
    q: params.q,
    page,
    limit: 24,
  });

  const totalPages = Math.ceil(total / 24);

  return (
    <div className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
      <div className="mb-12">
        <span className="text-label-sm mb-4 block tracking-[0.3em] text-on-surface-variant/50">
          Comunidad
        </span>
        <h1 className="text-headline-lg">{PHOTOGRAPHER_LABEL.pluralCap}</h1>
        <p className="mt-2 text-on-surface-variant">
          Descubrí quién captura los eventos y explorá sus galerías publicadas
        </p>
      </div>

      <form className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder={`Buscar ${PHOTOGRAPHER_LABEL.plural}…`}
          className="flex-1 border border-white/10 bg-transparent px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="text-label-sm bg-primary px-6 py-2 tracking-widest text-background"
        >
          Buscar
        </button>
      </form>

      {photographers.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-on-surface-variant">
            {total} {total === 1 ? PHOTOGRAPHER_LABEL.singular : PHOTOGRAPHER_LABEL.plural}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photographers.map((photographer) => (
              <Link
                key={photographer.id}
                href={routes.photographerPublic(photographer.id)}
                className="block hairline-border p-5 transition-colors hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-headline-md line-clamp-1">{photographer.displayName}</h2>
                  {photographer.isVerified && (
                    <BadgeCheck className="h-5 w-5 shrink-0 text-primary" aria-label="Verificado" />
                  )}
                </div>
                {photographer.bio && (
                  <p className="mt-2 line-clamp-3 text-sm text-on-surface-variant">
                    {photographer.bio}
                  </p>
                )}
                <p className="mt-4 text-sm text-on-surface-variant">
                  {photographer.publishedEventCount}{" "}
                  {photographer.publishedEventCount === 1 ? "evento publicado" : "eventos publicados"}
                </p>
                {photographer.instagramHandle && (
                  <p className="mt-1 text-sm text-on-surface-variant/70">
                    {photographer.instagramHandle}
                  </p>
                )}
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({
                    ...(params.q ? { q: params.q } : {}),
                    page: String(p),
                  })}`}
                  className={`px-3 py-1 text-sm ${
                    p === page
                      ? "bg-primary text-background"
                      : "text-on-surface-variant hover:bg-white/5"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-on-surface-variant">
            {params.q
              ? `No encontramos ${PHOTOGRAPHER_LABEL.plural} con ese criterio.`
              : `Todavía no hay ${PHOTOGRAPHER_LABEL.plural} publicados.`}
          </p>
          <Link href={routes.events} className="mt-4 inline-block text-sm underline">
            Explorar eventos
          </Link>
        </div>
      )}
    </div>
  );
}
