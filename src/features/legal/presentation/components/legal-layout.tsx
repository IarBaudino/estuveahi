import Link from "next/link";
import { legalConfig, legalDocuments } from "@/config/legal";
import { routes } from "@/config/routes";
import { cn } from "@/shared/lib/utils";

interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
}

export interface LegalDocumentContent {
  title: string;
  subtitle: string;
  sections: LegalSection[];
}

interface LegalLayoutProps {
  currentSlug: string;
  content: LegalDocumentContent;
}

export function LegalLayout({ currentSlug, content }: LegalLayoutProps) {
  return (
    <div className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop md:py-16">
      <div className="mb-10">
        <Link
          href={routes.legal.hub}
          className="text-label-sm tracking-widest text-on-surface-variant transition-colors hover:text-primary"
        >
          ← Legales
        </Link>
        <h1 className="mt-4 text-headline-lg text-primary">{content.title}</h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">{content.subtitle}</p>
        <p className="text-caption mt-4 text-on-surface-variant/60">
          Última actualización: {legalConfig.lastUpdated}
        </p>
      </div>

      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="sticky top-24 space-y-1">
            {legalDocuments.map((doc) => (
              <Link
                key={doc.slug}
                href={routes.legal.document(doc.slug)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition-colors",
                  currentSlug === doc.slug
                    ? "bg-white/5 font-medium text-primary"
                    : "text-on-surface-variant hover:bg-white/5 hover:text-white",
                )}
              >
                {doc.title}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 flex-1 space-y-10">
          {content.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-headline-sm text-primary">{section.title}</h2>
              <div className="mt-4 space-y-4 text-on-surface-variant">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.list.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <footer className="hairline-border mt-12 rounded-xl p-6 text-sm text-on-surface-variant/80">
            <p>
              Consultas legales:{" "}
              <a
                href={`mailto:${legalConfig.responsible.email}`}
                className="text-primary underline-offset-2 hover:underline"
              >
                {legalConfig.responsible.email}
              </a>
            </p>
            <p className="mt-2 text-caption text-on-surface-variant/50">
              Este texto tiene carácter informativo. Se recomienda su revisión por
              profesionales del derecho antes de su publicación definitiva.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
