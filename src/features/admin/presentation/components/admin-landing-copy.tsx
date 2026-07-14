"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import type { LandingCopy } from "@/config/landing.defaults";
import {
  restoreDefaultLandingCopyAction,
  updateLandingCopyAction,
} from "@/features/admin/presentation/actions/landing.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { emitToastError, emitToastSuccess } from "@/shared/lib/toast-bus";

interface AdminLandingCopyProps {
  copy: LandingCopy;
}

export function AdminLandingCopy({ copy: initialCopy }: AdminLandingCopyProps) {
  const router = useRouter();
  const [copy, setCopy] = useState(initialCopy);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setCopy(initialCopy);
  }, [initialCopy]);

  const { execute: save, isExecuting: saving } = useAction(updateLandingCopyAction, {
    onSuccess: () => {
      setMessage("Textos guardados");
      emitToastSuccess("Textos guardados");
      router.refresh();
    },
    onError: () => {
      setMessage("No se pudieron guardar los textos");
      emitToastError("No se pudieron guardar los textos");
    },
  });

  const { execute: restore, isExecuting: restoring } = useAction(
    restoreDefaultLandingCopyAction,
    {
      onSuccess: ({ data }) => {
        if (data?.copy) setCopy(data.copy);
        setMessage("Textos restaurados");
        emitToastSuccess("Textos restaurados");
        router.refresh();
      },
    },
  );

  function update<K extends keyof LandingCopy>(key: K, value: LandingCopy[K]) {
    setCopy((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 hairline-border bg-surface-container p-4 sm:p-5">
        <div>
          <h3 className="text-sm font-semibold">Hero principal</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Título, subtítulo y botones de la primera pantalla.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Título — línea 1"
            value={copy.heroTitleLine1}
            onChange={(e) => update("heroTitleLine1", e.target.value)}
          />
          <Input
            label="Título — línea 2"
            value={copy.heroTitleLine2}
            onChange={(e) => update("heroTitleLine2", e.target.value)}
          />
        </div>
        <Textarea
          label="Subtítulo"
          value={copy.heroSubtitle}
          onChange={(e) => update("heroSubtitle", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Botón principal"
            value={copy.heroCtaPrimary}
            onChange={(e) => update("heroCtaPrimary", e.target.value)}
          />
          <Input
            label="Botón secundario"
            value={copy.heroCtaSecondary}
            onChange={(e) => update("heroCtaSecondary", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4 hairline-border bg-surface-container p-4 sm:p-5">
        <div>
          <h3 className="text-sm font-semibold">Sección fotografxs</h3>
        </div>
        <Input
          label="Etiqueta superior"
          value={copy.photographerEyebrow}
          onChange={(e) => update("photographerEyebrow", e.target.value)}
        />
        <Input
          label="Título"
          value={copy.photographerTitle}
          onChange={(e) => update("photographerTitle", e.target.value)}
        />
        <Textarea
          label="Texto"
          value={copy.photographerBody}
          onChange={(e) => update("photographerBody", e.target.value)}
        />
        <Input
          label="Botón"
          value={copy.photographerCta}
          onChange={(e) => update("photographerCta", e.target.value)}
        />
      </section>

      <section className="space-y-4 hairline-border bg-surface-container p-4 sm:p-5">
        <div>
          <h3 className="text-sm font-semibold">CTA final</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Título — línea 1"
            value={copy.finalCtaTitleLine1}
            onChange={(e) => update("finalCtaTitleLine1", e.target.value)}
          />
          <Input
            label="Título — línea 2"
            value={copy.finalCtaTitleLine2}
            onChange={(e) => update("finalCtaTitleLine2", e.target.value)}
          />
        </div>
        <Input
          label="Botón"
          value={copy.finalCtaButton}
          onChange={(e) => update("finalCtaButton", e.target.value)}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          isLoading={saving}
          onClick={() => save(copy)}
        >
          Guardar textos
        </Button>
        <Button
          type="button"
          variant="outline"
          isLoading={restoring}
          onClick={() => {
            if (confirm("¿Restaurar los textos por defecto?")) restore();
          }}
        >
          Restaurar defaults
        </Button>
        {message && <p className="text-sm text-on-surface-variant">{message}</p>}
      </div>
    </div>
  );
}
