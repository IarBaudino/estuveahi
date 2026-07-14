import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Camera,
  Heart,
  Home,
  ImageIcon,
  LayoutDashboard,
  QrCode,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  User,
  UserCheck,
  UserPlus,
  Users,
  Shield,
} from "lucide-react";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Etiqueta corta para la barra inferior en móvil */
  shortLabel?: string;
  /** Si es true, aparece en la barra inferior del admin (el resto va al menú) */
  adminMobilePrimary?: boolean;
}

export const photographerNav: DashboardNavItem[] = [
  {
    href: routes.photographer.dashboard,
    label: "Dashboard",
    shortLabel: "Inicio",
    icon: LayoutDashboard,
  },
  {
    href: routes.photographer.events,
    label: "Eventos",
    icon: Calendar,
  },
  {
    href: routes.photographer.requests,
    label: "Solicitudes",
    shortLabel: "Ventas",
    icon: ShoppingBag,
  },
  {
    href: routes.photographer.profile,
    label: "Perfil",
    icon: Settings,
  },
  {
    href: routes.photographer.settings,
    label: "Ajustes",
    icon: SlidersHorizontal,
  },
];

export const adminNav: DashboardNavItem[] = [
  {
    href: routes.admin.dashboard,
    label: "Dashboard",
    shortLabel: "Inicio",
    icon: LayoutDashboard,
    adminMobilePrimary: true,
  },
  {
    href: routes.admin.users,
    label: "Usuarios",
    icon: Users,
    adminMobilePrimary: true,
  },
  {
    href: routes.admin.events,
    label: "Eventos",
    icon: Calendar,
    adminMobilePrimary: true,
  },
  {
    href: routes.admin.photographers,
    label: PHOTOGRAPHER_LABEL.pluralCap,
    shortLabel: "Solicitudes",
    icon: UserCheck,
  },
  {
    href: routes.admin.content,
    label: "Contenido",
    icon: ImageIcon,
  },
  {
    href: routes.admin.requests,
    label: "Solicitudes",
    shortLabel: "Pedidos",
    icon: ShoppingBag,
    adminMobilePrimary: true,
  },
  {
    href: routes.admin.qr,
    label: "QR web",
    shortLabel: "QR",
    icon: QrCode,
  },
  {
    href: routes.admin.config,
    label: "Configuración",
    shortLabel: "Config",
    icon: SlidersHorizontal,
  },
];

export const adminPhotographerLinks: DashboardNavItem[] = [
  {
    href: routes.photographer.profile,
    label: "Mi perfil fotografx",
    shortLabel: "Perfil FX",
    icon: User,
  },
  {
    href: routes.photographer.dashboard,
    label: PHOTOGRAPHER_LABEL.panel,
    shortLabel: "Panel FX",
    icon: Camera,
  },
];

export const photographerAdminLink: DashboardNavItem = {
  href: routes.admin.dashboard,
  label: "Panel admin",
  shortLabel: "Admin",
  icon: Shield,
};

export const clientNav: DashboardNavItem[] = [
  { href: routes.client.dashboard, label: "Inicio", icon: Home },
  { href: routes.events, label: "Eventos", icon: Calendar },
  {
    href: routes.photographers,
    label: PHOTOGRAPHER_LABEL.pluralCap,
    icon: Camera,
  },
  { href: routes.client.favorites, label: "Favoritos", icon: Heart },
  {
    href: routes.client.requests,
    label: "Solicitudes",
    shortLabel: "Mis pedidos",
    icon: ShoppingBag,
  },
  { href: routes.client.profile, label: "Mi perfil", icon: User },
];

export const clientMobileNav: DashboardNavItem[] = [
  { href: routes.client.dashboard, label: "Inicio", shortLabel: "Inicio", icon: Home },
  { href: routes.events, label: "Eventos", icon: Calendar },
  {
    href: routes.photographers,
    label: PHOTOGRAPHER_LABEL.pluralCap,
    shortLabel: "Fotografxs",
    icon: Camera,
  },
  { href: routes.client.favorites, label: "Favoritos", icon: Heart },
];

export const clientMobileMenuNav: DashboardNavItem[] = [
  {
    href: routes.client.requests,
    label: "Solicitudes",
    shortLabel: "Mis pedidos",
    icon: ShoppingBag,
  },
  { href: routes.client.profile, label: "Mi perfil", icon: User },
  {
    href: routes.hirePhotographer,
    label: `Contratar ${PHOTOGRAPHER_LABEL.singular}`,
    shortLabel: "Contratar",
    icon: Camera,
  },
  {
    href: routes.becomePhotographer,
    label: `Ser ${PHOTOGRAPHER_LABEL.singular}`,
    shortLabel: "Ser fotografx",
    icon: UserPlus,
  },
];

export const publicMobileNav: DashboardNavItem[] = [
  { href: routes.home, label: "Inicio", shortLabel: "Inicio", icon: Home },
  { href: routes.events, label: "Eventos", icon: Calendar },
  {
    href: routes.photographers,
    label: PHOTOGRAPHER_LABEL.pluralCap,
    shortLabel: "Fotografxs",
    icon: Camera,
  },
  {
    href: routes.becomePhotographer,
    label: `Ser ${PHOTOGRAPHER_LABEL.singular}`,
    shortLabel: "Ser FX",
    icon: UserPlus,
  },
];

export const publicMobileMenuNav: DashboardNavItem[] = [
  {
    href: routes.hirePhotographer,
    label: `Contratar ${PHOTOGRAPHER_LABEL.singular}`,
    shortLabel: "Contratar",
    icon: Camera,
  },
  {
    href: routes.client.favorites,
    label: "Mis favoritos",
    shortLabel: "Favoritos",
    icon: Heart,
  },
  {
    href: routes.client.requests,
    label: "Mis solicitudes",
    shortLabel: "Pedidos",
    icon: ShoppingBag,
  },
  { href: routes.legal.hub, label: "Legales", icon: ImageIcon },
];

export function isDashboardNavActive(currentPath: string, href: string): boolean {
  if (href === routes.home) {
    return currentPath === href;
  }
  if (href === routes.photographer.dashboard || href === routes.admin.dashboard) {
    return currentPath === href;
  }
  if (href === routes.client.dashboard) {
    return currentPath === href;
  }
  if (href === routes.events) {
    return currentPath === href || currentPath.startsWith("/eventos/");
  }
  if (href === routes.photographers) {
    return currentPath === href || currentPath.startsWith("/fotografxs/");
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}
