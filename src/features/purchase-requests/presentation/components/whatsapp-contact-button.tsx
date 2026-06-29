import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/shared/lib/whatsapp";
import { cn } from "@/shared/lib/utils";

interface WhatsAppContactButtonProps {
  phone: string | null | undefined;
  message: string;
  className?: string;
  compact?: boolean;
}

export function WhatsAppContactButton({
  phone,
  message,
  className,
  compact = false,
}: WhatsAppContactButtonProps) {
  const url = phone ? buildWhatsAppUrl(phone, message) : null;

  if (!url) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-on-surface-variant/60",
          compact ? "h-8" : "h-10 w-full",
          className,
        )}
        title="El cliente no tiene teléfono cargado en su perfil"
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        {!compact && "Sin teléfono para WhatsApp"}
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 text-sm font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/20",
        compact ? "h-8 px-3 text-xs" : "h-10 w-full sm:w-auto",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4 shrink-0" />
      {compact ? "WhatsApp" : "Escribir por WhatsApp"}
    </a>
  );
}
