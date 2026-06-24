export type TrafficSection =
  | "home"
  | "events_list"
  | "event_gallery"
  | "event_photo"
  | "photographers_list"
  | "photographer_profile"
  | "qr"
  | "legal"
  | "auth"
  | "become_photographer"
  | "other";

export interface TrafficSectionMeta {
  label: string;
  description: string;
}

export const TRAFFIC_SECTION_META: Record<TrafficSection, TrafficSectionMeta> = {
  home: {
    label: "Inicio",
    description: "Página principal del sitio",
  },
  events_list: {
    label: "Catálogo de eventos",
    description: "Listado público en /eventos",
  },
  event_gallery: {
    label: "Galería de un evento",
    description: "Página pública de un evento con sus fotos",
  },
  event_photo: {
    label: "Vista de foto",
    description: "Foto ampliada dentro de un evento",
  },
  photographers_list: {
    label: "Catálogo de fotografxs",
    description: "Listado en /fotografxs",
  },
  photographer_profile: {
    label: "Perfil de fotografx",
    description: "Página pública de un fotógrafo",
  },
  qr: {
    label: "Acceso por QR",
    description: "Enlaces /e/... desde códigos QR del evento",
  },
  legal: {
    label: "Legales",
    description: "Términos, privacidad y documentos legales",
  },
  auth: {
    label: "Login y registro",
    description: "Páginas de entrada o alta de cuenta",
  },
  become_photographer: {
    label: "Ser fotografx",
    description: "Formulario para postularse como fotógrafo",
  },
  other: {
    label: "Otras páginas",
    description: "Resto del sitio público",
  },
};

const SECTION_ORDER: TrafficSection[] = [
  "home",
  "events_list",
  "event_gallery",
  "event_photo",
  "qr",
  "photographers_list",
  "photographer_profile",
  "become_photographer",
  "auth",
  "legal",
  "other",
];

export function classifyTrafficPath(pathname: string): TrafficSection {
  const path = pathname.split("?")[0] ?? pathname;

  if (path === "/") return "home";
  if (path === "/eventos") return "events_list";
  if (path.startsWith("/eventos/")) {
    const segments = path.split("/").filter(Boolean);
    return segments.length >= 3 ? "event_photo" : "event_gallery";
  }
  if (path === "/fotografxs") return "photographers_list";
  if (path.startsWith("/fotografxs/")) return "photographer_profile";
  if (path === "/e" || path.startsWith("/e/")) return "qr";
  if (path.startsWith("/legales")) return "legal";
  if (path === "/login" || path === "/register") return "auth";
  if (path === "/ser-fotografx") return "become_photographer";
  return "other";
}

export function orderedTrafficSections(): TrafficSection[] {
  return SECTION_ORDER;
}

export function formatTrafficPathLabel(pathname: string): string {
  const path = pathname.split("?")[0] ?? pathname;
  const section = classifyTrafficPath(path);

  if (path === "/") return TRAFFIC_SECTION_META.home.label;
  if (path === "/eventos") return TRAFFIC_SECTION_META.events_list.label;
  if (path.startsWith("/eventos/")) {
    const slug = path.split("/")[2];
    return slug ? `Galería · ${slug}` : TRAFFIC_SECTION_META.event_gallery.label;
  }
  if (path === "/fotografxs") return TRAFFIC_SECTION_META.photographers_list.label;
  if (path.startsWith("/fotografxs/")) {
    return `${TRAFFIC_SECTION_META.photographer_profile.label}`;
  }
  if (path.startsWith("/e/")) {
    const code = path.split("/")[2];
    return code ? `QR · ${code}` : TRAFFIC_SECTION_META.qr.label;
  }

  return TRAFFIC_SECTION_META[section].label;
}

export function encodePathDocId(pathname: string): string {
  return Buffer.from(pathname, "utf8").toString("base64url").slice(0, 1500);
}
