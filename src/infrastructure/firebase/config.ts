import { DomainError } from "@/domain/errors/domain-errors";

const PLACEHOLDER_MARKERS = [
  "placeholder",
  "your-project",
  "your-api-key",
  "your-private-key",
] as const;

function isPlaceholderValue(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

export function isFirebaseConfigured(): boolean {
  return (
    !isPlaceholderValue(process.env.FIREBASE_PROJECT_ID) &&
    !isPlaceholderValue(process.env.FIREBASE_CLIENT_EMAIL) &&
    !isPlaceholderValue(process.env.FIREBASE_PRIVATE_KEY) &&
    !isPlaceholderValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
  );
}

export function assertFirebaseConfigured(): void {
  if (!isFirebaseConfigured()) {
    throw new DomainError(
      "Firebase no está configurado. Copia .env.example a .env.local y agrega las credenciales de tu proyecto.",
      "FIREBASE_NOT_CONFIGURED",
    );
  }
}
