"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MaterialIcon } from "@/shared/components/icon";
import { registerToastListener } from "@/shared/lib/toast-bus";
import {
  toastMessages,
  type ToastInput,
  type ToastVariant,
} from "@/shared/lib/toast-messages";
import { cn } from "@/shared/lib/utils";

export type { ToastInput, ToastVariant };
export { toastMessages };

interface ToastItem extends Required<Omit<ToastInput, "durationMs">> {
  id: string;
  durationMs: number;
}

interface ToastContextValue {
  toast: (input: ToastInput | string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 3200;

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput | string) => {
    const normalized =
      typeof input === "string" ? { message: input } : input;
    const item: ToastItem = {
      id: createId(),
      message: normalized.message,
      variant: normalized.variant ?? "success",
      durationMs: normalized.durationMs ?? DEFAULT_DURATION_MS,
    };
    setItems((current) => [...current.slice(-4), item]);
  }, []);

  useEffect(() => {
    registerToastListener(toast);
    return () => registerToastListener(null);
  }, [toast]);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (message) => toast({ message, variant: "success" }),
      error: (message) => toast({ message, variant: "error" }),
      info: (message) => toast({ message, variant: "info" }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {items.map((item) => (
          <ToastBanner key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastBanner({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), item.durationMs);
    return () => window.clearTimeout(timer);
  }, [item.durationMs, item.id, onDismiss]);

  const icon =
    item.variant === "success"
      ? "check_circle"
      : item.variant === "error"
        ? "error"
        : "info";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md",
        item.variant === "success" &&
          "border-emerald-500/35 bg-emerald-950/90 text-emerald-100",
        item.variant === "error" &&
          "border-red-500/35 bg-red-950/90 text-red-100",
        item.variant === "info" &&
          "border-white/15 bg-zinc-950/90 text-on-surface",
      )}
    >
      <MaterialIcon name={icon} className="mt-0.5 shrink-0 text-base" />
      <p className="flex-1 text-sm leading-snug">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 rounded p-1 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Cerrar aviso"
      >
        <MaterialIcon name="close" className="text-base" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}
