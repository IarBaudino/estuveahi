import type { Metadata } from "next";
import { LegalHub } from "@/features/legal/presentation/components/legal-hub";

export const metadata: Metadata = {
  title: "Información legal",
  description: "Términos, privacidad, cookies y documentación legal de EstuveAhí.",
};

export default function LegalesPage() {
  return <LegalHub />;
}
