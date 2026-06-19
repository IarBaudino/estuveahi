import { DomainError } from "@/domain/errors/domain-errors";

const PLACEHOLDER_MARKERS = [
  "placeholder",
  "your-project",
  "your-anon-key",
  "your-service-role-key",
] as const;

function isPlaceholderValue(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

/** Solo Storage — auth y DB van por Firebase */
export function isSupabaseStorageConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (isPlaceholderValue(url) || isPlaceholderValue(serviceKey)) {
    return false;
  }

  try {
    const parsed = new URL(url!);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export function assertSupabaseStorageConfigured(): void {
  if (!isSupabaseStorageConfigured()) {
    throw new DomainError(
      "Supabase Storage no está configurado. Agregá NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.",
      "SUPABASE_NOT_CONFIGURED",
    );
  }
}

export function getSupabaseUrl(): string {
  assertSupabaseStorageConfigured();
  return process.env.NEXT_PUBLIC_SUPABASE_URL!;
}

export function getSupabaseServiceKey(): string {
  assertSupabaseStorageConfigured();
  return process.env.SUPABASE_SERVICE_ROLE_KEY!;
}
