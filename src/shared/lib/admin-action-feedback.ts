function showAdminActionError(error: { serverError?: string; validationErrors?: unknown }) {
  const message =
    error.serverError ??
    (error.validationErrors ? "Datos inválidos" : "No se pudo completar la acción");
  window.alert(message);
}

export { showAdminActionError };
