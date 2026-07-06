import Link from "next/link";
import { BadgeCheck, ExternalLink, Globe, AtSign, Mail, Phone, Images } from "lucide-react";
import type { PublicPhotographer } from "@/domain/entities/public-photographer";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { routes } from "@/config/routes";
import { PhotographerAvatar } from "@/features/photographers/presentation/components/photographer-avatar";
import {
  formatInstagramLabel,
  normalizeExternalUrl,
  normalizeInstagramUrl,
} from "@/shared/lib/photographer-links";
import { cn } from "@/shared/lib/utils";

interface PhotographerPublicProfileProps {
  photographer: PublicPhotographer;
  className?: string;
  showGalleryLink?: boolean;
  variant?: "page" | "modal";
}

function ContactRow({
  icon: Icon,
  label,
  href,
  children,
}: {
  icon: typeof Mail;
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
      <span className="min-w-0 break-words">{children}</span>
    </>
  );

  return (
    <div>
      <p className="text-caption mb-1 text-on-surface-variant/60">{label}</p>
      {href ? (
        <a
          href={href}
          className="flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-primary"
        >
          {inner}
        </a>
      ) : (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">{inner}</div>
      )}
    </div>
  );
}

export function PhotographerPublicProfile({
  photographer,
  className,
  showGalleryLink = true,
  variant = "page",
}: PhotographerPublicProfileProps) {
  const {
    id,
    displayName,
    bio,
    websiteUrl,
    instagramHandle,
    portfolioUrl,
    isVerified,
    publishedEventCount,
    hasAvatar,
    phone,
    email,
    contactName,
  } = photographer;

  const hasLinks = !!(websiteUrl || instagramHandle || portfolioUrl);
  const galleryLabel =
    publishedEventCount === 1
      ? "1 evento publicado"
      : `${publishedEventCount} eventos publicados`;
  const isModal = variant === "modal";

  if (isModal) {
    return (
      <div
        className={cn(
          "grid min-h-0 min-w-0 grid-cols-1 sm:grid-cols-[auto_minmax(300px,380px)]",
          className,
        )}
      >
        {/* Izquierda: foto arriba + datos | contacto */}
        <div className="w-max max-w-full shrink-0 border-b border-white/10 p-4 sm:border-b-0 sm:border-r sm:pr-5">
          <div className="w-max max-w-full">
            <div className="relative mx-auto aspect-[4/5] w-[220px] overflow-hidden bg-surface-container">
              <PhotographerAvatar
                userId={id}
                displayName={displayName}
                hasAvatar={hasAvatar}
                className="absolute inset-0 h-full w-full"
                imageClassName="h-full w-full object-cover"
                sizes="220px"
              />
            </div>

            <div className="mt-4 w-max max-w-full space-y-3">
              <div>
                <div className="flex flex-wrap items-center gap-1">
                  <h2 className="whitespace-nowrap text-sm font-semibold leading-tight">{displayName}</h2>
                  {isVerified && (
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Verificado" />
                  )}
                </div>
                {contactName && contactName !== displayName && (
                  <p className="mt-0.5 whitespace-nowrap text-xs text-on-surface-variant">{contactName}</p>
                )}
                <p className="mt-1 whitespace-nowrap text-[11px] leading-snug text-on-surface-variant/80">
                  {galleryLabel}
                </p>
              </div>

              <div className="space-y-1 border-t border-white/10 pt-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant/50">
                  Contacto
                </p>
                {phone ? (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex w-max max-w-full items-center gap-1 text-xs leading-normal text-on-surface-variant hover:text-primary"
                    title={phone}
                  >
                    <Phone className="h-3 w-3 shrink-0" />
                    <span className="whitespace-nowrap">{phone}</span>
                  </a>
                ) : null}
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="flex w-max max-w-full items-center gap-1 text-xs leading-normal text-on-surface-variant hover:text-primary"
                    title={email}
                  >
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="whitespace-nowrap">{email}</span>
                  </a>
                ) : null}
                {!phone && !email && (
                  <p className="text-xs text-on-surface-variant/60">—</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Derecha: mini bio + redes */}
        <div className="flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto p-4 sm:p-5 sm:pl-6">
          <div className="min-w-0 shrink-0">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-on-surface-variant/50">
              Sobre {PHOTOGRAPHER_LABEL.singular}
            </p>
            {bio ? (
              <p className="line-clamp-5 text-sm leading-relaxed text-on-surface-variant">{bio}</p>
            ) : (
              <p className="text-xs italic text-on-surface-variant/60">Sin bio pública.</p>
            )}
          </div>

          {hasLinks && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant/50">
                Redes
              </p>
              <ul className="space-y-1">
                {portfolioUrl && (
                  <li>
                    <a
                      href={normalizeExternalUrl(portfolioUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary sm:text-sm"
                    >
                      <Images className="h-3.5 w-3.5 shrink-0" />
                      Portfolio
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </li>
                )}
                {websiteUrl && (
                  <li>
                    <a
                      href={normalizeExternalUrl(websiteUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary sm:text-sm"
                    >
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      Sitio web
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </li>
                )}
                {instagramHandle && (
                  <li>
                    <a
                      href={normalizeInstagramUrl(instagramHandle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary sm:text-sm"
                    >
                      <AtSign className="h-3.5 w-3.5 shrink-0" />
                      {formatInstagramLabel(instagramHandle)}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {showGalleryLink && publishedEventCount > 0 && (
            <Link
              href={routes.photographerPublic(id)}
              className="text-label-sm mt-1 inline-flex items-center gap-1.5 tracking-widest text-primary hover:opacity-80"
            >
              Ver galerías
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-white/10",
        className,
      )}
    >
      {/* Foto y contacto */}
      <div className="flex flex-col p-6 md:p-8">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden bg-surface-container md:mx-0 md:max-w-none">
          <PhotographerAvatar
            userId={id}
            displayName={displayName}
            hasAvatar={hasAvatar}
            sizes="(max-width: 768px) 280px, 50vw"
          />
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-headline-md">{displayName}</h2>
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  Verificado
                </span>
              )}
            </div>
            {contactName && contactName !== displayName && (
              <p className="mt-1 text-sm text-on-surface-variant">{contactName}</p>
            )}
            <p className="mt-2 text-sm text-on-surface-variant/80">{galleryLabel}</p>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-4">
            <p className="text-label-sm tracking-widest text-on-surface-variant/50">Contacto</p>
            {phone ? (
              <ContactRow icon={Phone} label="Teléfono" href={`tel:${phone.replace(/\s/g, "")}`}>
                {phone}
              </ContactRow>
            ) : null}
            {email ? (
              <ContactRow icon={Mail} label="Email" href={`mailto:${email}`}>
                {email}
              </ContactRow>
            ) : null}
            {!phone && !email && (
              <p className="text-sm text-on-surface-variant/70">
                Sin datos de contacto publicados todavía.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bio y presencia laboral */}
      <div className="flex flex-col border-t border-white/10 p-6 md:border-t-0 md:p-8">
        <p className="text-label-sm mb-3 tracking-widest text-on-surface-variant/50">
          Sobre {PHOTOGRAPHER_LABEL.singular}
        </p>

        {bio ? (
          <p className="text-sm leading-relaxed text-on-surface-variant">{bio}</p>
        ) : (
          <p className="text-sm italic text-on-surface-variant/60">
            Este {PHOTOGRAPHER_LABEL.singular} todavía no agregó una bio pública.
          </p>
        )}

        {hasLinks && (
          <div className="mt-6 space-y-3">
            <p className="text-label-sm tracking-widest text-on-surface-variant/50">
              Portfolio y redes
            </p>
            <ul className="space-y-2">
              {portfolioUrl && (
                <li>
                  <a
                    href={normalizeExternalUrl(portfolioUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <Images className="h-4 w-4 shrink-0" />
                    Portfolio
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </li>
              )}
              {websiteUrl && (
                <li>
                  <a
                    href={normalizeExternalUrl(websiteUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <Globe className="h-4 w-4 shrink-0" />
                    Sitio web
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </li>
              )}
              {instagramHandle && (
                <li>
                  <a
                    href={normalizeInstagramUrl(instagramHandle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <AtSign className="h-4 w-4 shrink-0" />
                    {formatInstagramLabel(instagramHandle)}
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}

        {showGalleryLink && publishedEventCount > 0 && (
          <div className="mt-auto border-t border-white/10 pt-6">
            <Link
              href={routes.photographerPublic(id)}
              className="text-label-sm inline-flex items-center gap-2 tracking-widest text-primary transition-opacity hover:opacity-80"
            >
              Ver galerías publicadas
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
