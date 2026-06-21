import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { getUserFavorites } from "@/features/favorites/infrastructure/favorite.repository";
import { getClientRequests } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import { isProfileComplete } from "@/shared/lib/profile";
import { Heart, ShoppingBag, User, ArrowRight, Camera } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const [favorites, requests, profile] = await Promise.all([
    getUserFavorites(session.user.id),
    getClientRequests(session.user.id),
    getProfileById(session.user.id),
  ]);

  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const profileComplete = profile
    ? isProfileComplete({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
      })
    : false;

  const cards = [
    {
      href: routes.client.favorites,
      icon: Heart,
      label: "Favoritos",
      value: favorites.length,
      hint: "Fotos guardadas",
    },
    {
      href: routes.client.requests,
      icon: ShoppingBag,
      label: "Solicitudes",
      value: requests.length,
      hint: pendingRequests > 0 ? `${pendingRequests} pendientes` : `Pedidos a ${PHOTOGRAPHER_LABEL.plural}`,
    },
    {
      href: routes.client.profile,
      icon: User,
      label: "Mi perfil",
      value: profileComplete ? "Completo" : "Incompleto",
      hint: profileComplete
        ? "Listo para solicitar fotos"
        : "Completá tus datos para pedir fotos",
    },
  ];

  return (
    <div>
      <h1 className="text-headline-lg">Mi cuenta</h1>
      <p className="text-on-surface-variant">
        Bienvenido{profile?.firstName ? `, ${profile.firstName}` : ""}
      </p>

      {!profileComplete && (
        <div className="mt-6 hairline-border bg-surface-container p-4">
          <p className="text-sm">
            Para solicitar fotos necesitás completar tu perfil con nombre, apellido,
            email y teléfono.
          </p>
          <Link
            href={routes.client.profile}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline"
          >
            Completar perfil
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {session.user.role === "client" && (
        <div className="mt-6 hairline-border bg-surface-container p-4">
          <div className="flex items-start gap-3">
            <Camera className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">¿Querés publicar y vender tus fotos?</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Enviá tu perfil para revisión. Un administrador debe aprobarla antes de que
                puedas crear eventos.
              </p>
              <Link
                href={routes.photographer.onboarding}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline"
              >
                Convertirme en {PHOTOGRAPHER_LABEL.singular}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(({ href, icon: Icon, label, value, hint }) => (
          <Link
            key={href}
            href={href}
            className="group hairline-border bg-surface-container p-5 transition-colors hover:bg-surface-container-high"
          >
            <div className="flex items-start justify-between">
              <Icon className="h-5 w-5 text-on-surface-variant" />
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-4 text-sm text-on-surface-variant">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
            <p className="mt-2 text-xs text-on-surface-variant">{hint}</p>
          </Link>
        ))}
      </div>

      {requests.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Últimas solicitudes</h2>
            <Link href={routes.client.requests} className="text-sm underline">
              Ver todas
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {requests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between hairline-border p-4"
              >
                <div>
                  <p className="font-medium">{req.events?.title ?? "Evento"}</p>
                  <p className="text-sm text-on-surface-variant">
                    {new Date(req.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <Badge>{req.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <Link
          href={routes.events}
          className="inline-flex items-center gap-2 text-sm underline"
        >
          Explorar eventos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
