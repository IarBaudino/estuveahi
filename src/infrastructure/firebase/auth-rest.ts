interface FirebaseSignInResponse {
  localId: string;
  email: string;
  idToken: string;
}

interface FirebaseSignInError {
  error?: { message?: string };
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<FirebaseSignInResponse> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Firebase API key no configurada");

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  const data = (await res.json()) as FirebaseSignInResponse & FirebaseSignInError;

  if (!res.ok) {
    const msg = data.error?.message ?? "Credenciales inválidas";
    if (msg.includes("INVALID_LOGIN_CREDENTIALS") || msg.includes("EMAIL_NOT_FOUND")) {
      throw new Error("Credenciales inválidas");
    }
    throw new Error(msg);
  }

  return data;
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Firebase API key no configurada");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const body: Record<string, string> = {
    requestType: "PASSWORD_RESET",
    email,
  };

  if (appUrl) {
    body.continueUrl = `${appUrl}/login`;
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (res.ok) return;

  const data = (await res.json()) as FirebaseSignInError;
  const msg = data.error?.message ?? "";

  if (msg.includes("EMAIL_NOT_FOUND")) {
    return;
  }

  if (msg.includes("TOO_MANY_ATTEMPTS")) {
    throw new Error("Demasiados intentos. Probá de nuevo más tarde.");
  }

  throw new Error("No pudimos enviar el correo. Verificá el email e intentá otra vez.");
}
