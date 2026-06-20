import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import {
  Calendar,
  Camera,
  Heart,
  ImageIcon,
  LayoutDashboard,
  QrCode,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  UserCheck,
  Users,
} from "lucide-react";
import { routes } from "@/config/routes";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const photographerNav: NavItem[] = [
  {
    href: routes.photographer.dashboard,
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: routes.photographer.events,
    label: "Eventos",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    href: routes.photographer.requests,
    label: "Solicitudes",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    href: routes.photographer.profile,
    label: "Perfil",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    href: routes.photographer.settings,
    label: "Ajustes",
    icon: <SlidersHorizontal className="h-4 w-4" />,
  },
];

const adminNav: NavItem[] = [
  {
    href: routes.admin.dashboard,
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: routes.admin.users,
    label: "Usuarios",
    icon: <Users className="h-4 w-4" />,
  },
  {
    href: routes.admin.events,
    label: "Eventos",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    href: routes.admin.photographers,
    label: "Fotógrafos",
    icon: <UserCheck className="h-4 w-4" />,
  },
  {
    href: routes.admin.content,
    label: "Contenido",
    icon: <ImageIcon className="h-4 w-4" />,
  },
  {
    href: routes.admin.requests,
    label: "Solicitudes",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    href: routes.admin.qr,
    label: "QR web",
    icon: <QrCode className="h-4 w-4" />,
  },
  {
    href: routes.admin.config,
    label: "Configuración",
    icon: <SlidersHorizontal className="h-4 w-4" />,
  },
];

function isActive(currentPath: string, href: string) {
  if (href === routes.photographer.dashboard || href === routes.admin.dashboard) {
    return currentPath === href;
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function DashboardSidebar({
  type,
  currentPath,
}: {
  type: "photographer" | "admin";
  currentPath: string;
}) {
  const items = type === "photographer" ? photographerNav : adminNav;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-white/10 p-4 md:block">
      <div className="mb-6 flex items-center gap-2 font-semibold">
        <Camera className="h-5 w-5" />
        {type === "photographer" ? "Fotógrafo" : "Admin"}
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors",
              isActive(currentPath, item.href)
                ? "bg-surface-container-high font-medium"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      {type === "photographer" && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <Link
            href={routes.client.favorites}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          >
            <Heart className="h-4 w-4" />
            Mis favoritos
          </Link>
        </div>
      )}
    </aside>
  );
}
