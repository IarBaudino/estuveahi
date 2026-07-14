export type ToastVariant = "success" | "error" | "info";

export interface ToastInput {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

/** Mensajes cortos reutilizables en dashboards. */
export const toastMessages = {
  saved: "Cambios guardados",
  created: "Creado correctamente",
  deleted: "Eliminado",
  published: "Publicado",
  updated: "Actualizado",
  notified: "Avisos enviados al panel",
  statusUpdated: "Estado actualizado",
} as const;
