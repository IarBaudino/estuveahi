"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Download } from "lucide-react";

export function AdminQrManager({ siteUrl }: { siteUrl: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(siteUrl, {
      width: 320,
      margin: 1,
      color: { dark: "#ffffff", light: "#000000" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [siteUrl]);

  function downloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "estuveahi-qr.png";
    link.click();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="hairline-border bg-surface-container p-6 text-center">
        <h2 className="font-semibold">QR de EstuveAhí</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Un solo código para imprimir. Lleva a la web principal.
        </p>
        <p className="mt-3 break-all font-mono text-sm">{siteUrl}</p>

        <div className="mt-8 flex justify-center">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="Código QR de EstuveAhí"
              className="h-[320px] w-[320px]"
            />
          ) : (
            <div className="flex h-[320px] w-[320px] items-center justify-center hairline-border text-sm text-on-surface-variant">
              Generando…
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadQr} disabled={!qrDataUrl}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PNG
          </Button>
          <Link href={siteUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              Abrir web
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-on-surface-variant">
          Escaneando el QR, la gente entra a {siteUrl} y desde ahí busca el
          evento y sus fotos.
        </p>
      </div>
    </div>
  );
}
