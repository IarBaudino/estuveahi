"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import type { LandingHeroFocus } from "@/config/landing.defaults";
import { updateLandingHeroFocusAction } from "@/features/admin/presentation/actions/landing.actions";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface AdminLandingHeroFocusProps {
  imageUrl: string;
  grayscale: boolean;
  heroFocus: LandingHeroFocus;
}

export function AdminLandingHeroFocus({
  imageUrl,
  grayscale,
  heroFocus: initialFocus,
}: AdminLandingHeroFocusProps) {
  const router = useRouter();
  const [focus, setFocus] = useState(initialFocus);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setFocus(initialFocus);
  }, [initialFocus.x, initialFocus.y]);

  const { execute, isExecuting } = useAction(updateLandingHeroFocusAction, {
    onSuccess: () => router.refresh(),
  });

  function save() {
    startTransition(() => {
      execute(focus);
    });
  }

  return (
    <div className="space-y-4 hairline-border bg-surface-container p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold">Encuadre del hero</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Mové los controles para decidir qué parte de la imagen se ve en pantalla completa. La
          vista previa imita el recorte del home.
        </p>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden bg-black sm:aspect-[21/9]">
        <Image
          src={imageUrl}
          alt="Vista previa del hero"
          fill
          unoptimized
          className={cn("object-cover opacity-80", grayscale && "grayscale")}
          style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
          sizes="(max-width: 768px) 100vw, 800px"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <p className="text-sm font-medium text-white/90">Vista previa del recorte</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="flex justify-between text-on-surface-variant">
            Horizontal <span className="font-mono text-on-surface">{Math.round(focus.x)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={focus.x}
            onChange={(e) => setFocus((prev) => ({ ...prev, x: Number(e.target.value) }))}
            className="w-full accent-white"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="flex justify-between text-on-surface-variant">
            Vertical <span className="font-mono text-on-surface">{Math.round(focus.y)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={focus.y}
            onChange={(e) => setFocus((prev) => ({ ...prev, y: Number(e.target.value) }))}
            className="w-full accent-white"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          isLoading={isExecuting || pending}
          onClick={save}
        >
          Guardar encuadre
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setFocus({ x: 50, y: 50 })}
        >
          Centrar
        </Button>
      </div>
    </div>
  );
}
