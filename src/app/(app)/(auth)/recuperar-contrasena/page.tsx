import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/presentation/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <ForgotPasswordForm />
    </div>
  );
}
