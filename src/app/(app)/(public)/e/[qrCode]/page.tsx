import { redirect, notFound } from "next/navigation";
import { getEventByQrCode } from "@/features/events/infrastructure/event.repository";
import { routes } from "@/config/routes";

interface PageProps {
  params: Promise<{ qrCode: string }>;
}

export default async function QRLandingPage({ params }: PageProps) {
  const { qrCode } = await params;
  const event = await getEventByQrCode(qrCode);

  if (!event) notFound();
  redirect(routes.event(event.slug));
}
