import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

/** Alias corto: mismo destino que el QR impreso (la home). */
export default function GeneralAccessPage() {
  redirect(routes.home);
}
