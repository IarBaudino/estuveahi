import { emitToastError, emitToastSuccess } from "@/shared/lib/toast-bus";
import { toastMessages } from "@/shared/lib/toast-messages";

/** Feedback estándar para useAction (cliente / fotografx / genérico). */
export function actionFeedback(options?: {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) {
  return {
    onSuccess: () => {
      emitToastSuccess(options?.successMessage ?? toastMessages.saved);
      options?.onSuccess?.();
    },
    onError: ({
      error,
    }: {
      error: { serverError?: string; validationErrors?: unknown };
    }) => {
      emitToastError(
        error.serverError ??
          options?.errorMessage ??
          "No se pudo completar la acción",
      );
      options?.onError?.();
    },
  };
}
