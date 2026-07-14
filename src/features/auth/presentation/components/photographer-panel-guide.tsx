import Link from "next/link";
import { MaterialIcon } from "@/shared/components/icon";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  PHOTOGRAPHER_PANEL_ACCESS,
  PHOTOGRAPHER_PANEL_GUIDE,
  PHOTOGRAPHER_VERIFIED_BENEFITS,
} from "@/features/auth/presentation/content/photographer-panel-guide";

interface PhotographerPanelGuideProps {
  isVerified: boolean;
  className?: string;
}

export function PhotographerPanelGuide({
  isVerified,
  className,
}: PhotographerPanelGuideProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="mb-1">
        <span className="text-label-sm tracking-[0.3em] text-on-surface-variant/50">
          {PHOTOGRAPHER_PANEL_GUIDE.eyebrow}
        </span>
      </div>

      <details className="group hairline-border p-5 transition-colors open:bg-white/5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">
              {PHOTOGRAPHER_PANEL_GUIDE.title}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {PHOTOGRAPHER_PANEL_GUIDE.description}
            </p>
          </div>
          <MaterialIcon
            name="expand_more"
            className="shrink-0 text-on-surface-variant transition-transform group-open:rotate-180"
          />
        </summary>

        <ul className="mt-5 space-y-3 border-t border-white/10 pt-5">
          {PHOTOGRAPHER_PANEL_ACCESS.map((item) => (
            <li key={item.title} className="flex gap-3">
              <MaterialIcon name={item.icon} className="mt-0.5 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <Link
                    href={item.href}
                    className="text-xs tracking-wider text-primary hover:underline"
                  >
                    {item.linkLabel} →
                  </Link>
                </div>
                <p className="mt-0.5 text-sm text-on-surface-variant/85">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </details>

      <details className="group hairline-border p-5 transition-colors open:bg-white/5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              {PHOTOGRAPHER_VERIFIED_BENEFITS.title}
            </h2>
            <Badge variant={isVerified ? "success" : "warning"}>
              {isVerified ? "Verificadx" : "Sin verificar"}
            </Badge>
          </div>
          <MaterialIcon
            name="expand_more"
            className="shrink-0 text-on-surface-variant transition-transform group-open:rotate-180"
          />
        </summary>

        <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
          <p className="text-sm text-on-surface-variant">
            {isVerified
              ? PHOTOGRAPHER_VERIFIED_BENEFITS.verifiedDescription
              : PHOTOGRAPHER_VERIFIED_BENEFITS.unverifiedDescription}
          </p>
          <ul className="space-y-3">
            {PHOTOGRAPHER_VERIFIED_BENEFITS.items.map((item) => (
              <li key={item.title} className="flex gap-3">
                <MaterialIcon name={item.icon} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm text-on-surface-variant/85">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </section>
  );
}
