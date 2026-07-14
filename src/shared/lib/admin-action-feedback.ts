import { emitToastError, emitToastSuccess } from "@/shared/lib/toast-bus";
import { toastMessages } from "@/shared/lib/toast-messages";

function showAdminActionError(error: {
  serverError?: string;
  validationErrors?: unknown;
}) {
  const message =
    error.serverError ??
    (error.validationErrors ? "Datos inválidos" : "No se pudo completar la acción");
  emitToastError(message);
}

function showAdminActionSuccess(message: string = toastMessages.saved) {
  emitToastSuccess(message);
}

/** Callbacks reutilizables para useAction en tablas admin. */
function adminActionFeedback(options?: {
  successMessage?: string;
  onSuccess?: () => void;
}) {
  return {
    onSuccess: () => {
      showAdminActionSuccess(options?.successMessage ?? toastMessages.saved);
      options?.onSuccess?.();
    },
    onError: ({
      error,
    }: {
      error: { serverError?: string; validationErrors?: unknown };
    }) => showAdminActionError(error),
  };
}

export { showAdminActionError, showAdminActionSuccess, adminActionFeedback };
