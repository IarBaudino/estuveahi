import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/presentation/components/register-form";

export const metadata: Metadata = {
  title: "Registrarse",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  );
}
