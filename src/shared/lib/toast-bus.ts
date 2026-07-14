import type { ToastInput, ToastVariant } from "@/shared/lib/toast-messages";

type ToastListener = (input: ToastInput) => void;

let listener: ToastListener | null = null;

export function registerToastListener(next: ToastListener | null) {
  listener = next;
}

export function emitToast(input: ToastInput | string) {
  if (!listener) return;
  listener(typeof input === "string" ? { message: input } : input);
}

export function emitToastSuccess(message: string) {
  emitToast({ message, variant: "success" });
}

export function emitToastError(message: string) {
  emitToast({ message, variant: "error" });
}

export function emitToastInfo(message: string) {
  emitToast({ message, variant: "info" as ToastVariant });
}
