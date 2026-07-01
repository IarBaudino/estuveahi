"use client";

import { X } from "lucide-react";
import { MaterialIcon } from "@/shared/components/icon";
import { Button } from "@/shared/ui/button";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import {
  PHOTOGRAPHER_ONBOARDING_BENEFITS,
  PHOTOGRAPHER_ONBOARDING_INTRO,
} from "@/features/auth/presentation/content/photographer-onboarding-info";

interface PhotographerOnboardingInfoModalProps {
  onContinue: () => void;
}

export function PhotographerOnboardingInfoModal({
  onContinue,
}: PhotographerOnboardingInfoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-labelledby="photographer-onboarding-title"
      aria-modal="true"
    >
      <div className="flex max-h-[min(100dvh,40rem)] w-full max-w-lg flex-col overflow-hidden hairline-border bg-surface-container sm:rounded-xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-label-sm tracking-[0.3em] text-on-surface-variant/60">
              {PHOTOGRAPHER_ONBOARDING_INTRO.eyebrow}
            </p>
            <h2 id="photographer-onboarding-title" className="text-headline-md mt-1">
              Antes de enviar tu solicitud
            </h2>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full p-2 text-on-surface-variant hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <h3 className="text-lg font-semibold">{PHOTOGRAPHER_ONBOARDING_INTRO.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {PHOTOGRAPHER_ONBOARDING_INTRO.description}
            </p>
          </div>

          <ul className="space-y-4">
            {PHOTOGRAPHER_ONBOARDING_BENEFITS.map((item) => (
              <li key={item.title} className="flex gap-4 rounded-lg bg-white/5 p-4">
                <MaterialIcon name={item.icon} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-label-sm tracking-widest">{item.title}</p>
                  <p className="mt-1 text-sm text-on-surface-variant/80">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-caption text-on-surface-variant/70">
            Un administrador revisará tu perfil antes de activar tu {PHOTOGRAPHER_LABEL.panel.toLowerCase()}.
          </p>
        </div>

        <div className="shrink-0 border-t border-white/10 p-5">
          <Button type="button" className="w-full" onClick={onContinue}>
            Entendido, completar solicitud
          </Button>
        </div>
      </div>
    </div>
  );
}
