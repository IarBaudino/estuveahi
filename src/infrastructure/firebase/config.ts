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

export function normalizePrivateKey(key: string): string {
  let normalized = key.trim();

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  normalized = normalized.replace(/\\n/g, "\n");
  normalized = normalized.replace(/\r\n/g, "\n");

  return normalized;
}

export interface FirebaseServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function parseServiceAccountJson(raw: string): FirebaseServiceAccount {
  const parsed = JSON.parse(raw) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new DomainError(
      "FIREBASE_SERVICE_ACCOUNT_JSON inválido: faltan project_id, client_email o private_key.",
      "FIREBASE_INVALID_JSON",
    );
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: normalizePrivateKey(parsed.private_key),
  };
}

export function resolveFirebaseCredentials(): FirebaseServiceAccount {
  const jsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonRaw && !isPlaceholderValue(jsonRaw)) {
    return parseServiceAccountJson(jsonRaw);
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY!),
  };
}

export function diagnoseFirebasePrivateKey():
  | { ok: true }
  | { ok: false; hint: string; details: Record<string, boolean | number> } {
  const raw = process.env.FIREBASE_PRIVATE_KEY ?? "";
  const normalized = normalizePrivateKey(raw);

  const details = {
    hasBegin: normalized.includes("BEGIN"),
    hasEnd: normalized.includes("END"),
    lineCount: normalized.split("\n").length,
    usesEscapedNewlines: raw.includes("\\n"),
    usesRealNewlines: raw.includes("\n"),
  };

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return { ok: true };
  }

  if (!details.hasBegin || !details.hasEnd) {
    return {
      ok: false,
      hint:
        "FIREBASE_PRIVATE_KEY debe incluir -----BEGIN PRIVATE KEY----- y -----END PRIVATE KEY----- en una sola línea con \\n entre segmentos (sin comillas).",
      details,
    };
  }

  if (details.lineCount < 3 && !details.usesEscapedNewlines) {
    return {
      ok: false,
      hint:
        "La clave parece estar en una sola línea sin saltos. En Vercel pegala con \\n literales entre cada línea del PEM.",
      details,
    };
  }

  return { ok: true };
}

export function isFirebaseConfigured(): boolean {
  const jsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonRaw && !isPlaceholderValue(jsonRaw)) {
    return !isPlaceholderValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  }

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
