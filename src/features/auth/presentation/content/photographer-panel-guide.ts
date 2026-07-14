import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { businessConfig } from "@/config/business";

export const PHOTOGRAPHER_PANEL_GUIDE = {
  eyebrow: "Guía",
  title: "Qué podés hacer en tu panel",
  description:
    "Accesos de fotografx logueadx en EstuveAhí: galerías, ventas y consultas de trabajo.",
} as const;

export const PHOTOGRAPHER_PANEL_ACCESS = [
  {
    icon: "calendar_month",
    title: "Eventos y galerías",
    text: `Creá eventos, subí fotos y publicá en cartelera (${businessConfig.eventListingDays} días). QR, precios y visibilidad desde un solo lugar.`,
    href: routes.photographer.events,
    linkLabel: "Eventos",
  },
  {
    icon: "shopping_bag",
    title: "Solicitudes de compra",
    text: "Sin comisión de plataforma: cotizás, cobrás y enviás la alta al cliente.",
    href: routes.photographer.requests,
    linkLabel: "Solicitudes",
  },
  {
    icon: "handshake",
    title: "Consultas para contratar",
    text: "Con cobertura por provincia, te avisamos si alguien busca fotografx en tu zona.",
    href: routes.photographer.requests,
    linkLabel: "Trabajos",
  },
  {
    icon: "badge",
    title: "Perfil público",
    text: `Tu ficha en el directorio de ${PHOTOGRAPHER_LABEL.plural}: bio, redes y provincias.`,
    href: routes.photographer.profile,
    linkLabel: "Perfil",
  },
  {
    icon: "tune",
    title: "Ajustes",
    text: "Cuenta, contraseña y WhatsApp de contacto.",
    href: routes.photographer.settings,
    linkLabel: "Ajustes",
  },
] as const;

export const PHOTOGRAPHER_VERIFIED_BENEFITS = {
  title: "Ventajas de estar verificadx",
  verifiedDescription:
    "Tu perfil muestra el sello: más confianza para quien compra fotos o quiere contratarte.",
  unverifiedDescription:
    "Todavía sin sello. Podés publicar y vender igual; un admin puede verificarte con el perfil completo.",
  items: [
    {
      icon: "verified",
      title: "Confianza",
      text: "Quien explora el catálogo ve que formás parte activa de la plataforma.",
    },
    {
      icon: "visibility",
      title: "Más presencia",
      text: "El badge refuerza tu ficha pública y tu propuesta profesional.",
    },
    {
      icon: "campaign",
      title: "Mejor para contratar",
      text: "En consultas de cobertura priorizamos perfiles claros, con zona cargada y verificados.",
    },
  ],
} as const;
