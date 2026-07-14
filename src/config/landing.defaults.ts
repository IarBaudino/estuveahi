export const LANDING_IMAGE_KEYS = [
  "hero",
  "festivales",
  "recitales",
  "teatro",
  "deportes",
  "photographer",
  "cta",
] as const;

export type LandingImageKey = (typeof LANDING_IMAGE_KEYS)[number];

/** Imágenes que se editan en admin (las de categorías quedaron fuera de la home). */
export const ACTIVE_LANDING_IMAGE_KEYS = ["hero", "photographer", "cta"] as const;
export type ActiveLandingImageKey = (typeof ACTIVE_LANDING_IMAGE_KEYS)[number];

export const LANDING_IMAGE_LABELS: Record<LandingImageKey, string> = {
  hero: "Hero principal",
  festivales: "Categoría — Festivales",
  recitales: "Categoría — Recitales",
  teatro: "Categoría — Teatro",
  deportes: "Categoría — Deportes",
  photographer: "Sección fotógrafos",
  cta: "Llamada a la acción final",
};

export const DEFAULT_LANDING_IMAGES: Record<LandingImageKey, string> = {
  hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuBj8-NIDsvIc5_94Ha-x7LzHsNh1LihHHqv-wFpJ72UmdcbSTzp0trQVvHRQYEA-dHOxpGOC6BfmPLatFDecBejxIs-dPGmwiyMEDTBiqYMZejt3StocqWf-p8esuguN99f3bDOmkv-tMqj3R1pgVBHvUY1dHW_D2T4xLFAgLjKA4fu2reOsxxce6vPTUs7OgC0FByFRRk_cwR4y_Mk1KLTVh7gVJYnfo3nOSjae0MG0v1kJmIKairhBgqEvIcoV13QlSehGCoPgqc",
  festivales:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAuglOv-XqARjIRYWSUPg-g-UDYxleA3hyI-kvEC5XAZyXSouMjaOTDOgmAwRm171bkc7eKDP_JuKN8kKiXiXEK_8j0ruTOHWwy_QliesHN-ShHDIhUkmU_C4t4ZiV1iXHCPamLkatrHHESaJSgVFqZRnwVoCK_0x-yXSyzdg4GexizSF1f8TSs25jeF8Ax5oJFYbpkQxqGXSl0ao-y6_iOtlG_cEYvGmgBOGKwwdhFChN8--TrXKxekwrj-s63kGYILQGdu7W7QY8",
  recitales:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB_0XxR4yszB3Zh9ylkNPDSyyFLF-ZbXcP3XK8KS5jbpxsUJzeNhD2tWcrlvmoTcFZ6OuGw4TaSJ59mH_wpOMx078zS5ichf6o0_N5NiDspHe5W3ERwv9RmK-JaGnGHLtH56Q2H-qDSpiwfN9l5TztbWKFSps1GZYTwkGlepkrZiw9qrIWGgnEd9R1kg_L-Cp8i_T3s4zAhbZ_8plfSNNooXutPbSRAzfI1ElgOMi_Uqp6BObMBPZZGcraxr9yziajdH4b6Wab95Vw",
  teatro:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDEam1_bbLpRd_SvWAkxbw-xPt4bDOMZR0R-I7bZ7044AF_6UIFrn9_z7dcCO3PKEQDsCwCCy-3hQBDjQ3XDzGOkrmFK0AOyc8mf4EijUagMb9XYqA1M4OJamGid_EeWJzkDBxii6xyFwg_-0AkLMAvEWu_t_-uhzr-r76fMgRlyFDcbOz_atb-SFYOTyzZCMcMaLlpgJ4KsI1b5OIeTf5yKgBd4y2XObl9okFntmTjVYAzlpMNPE-FZm9eIq9vMi5Y1tUkxVetJk4",
  deportes:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuALqYKWz-9cxaGmjY7ktbLASQ-bqihtQ9v0Pe_dwq2QqCvBkBmRk9sgju88gQPoIPeVHDlPvvGuNdhpx3RinFWmgmQ-88862j1WPOoYFzVC7BQSR99P8RNmIkLmp23pdr8PjfqgKwpG7TCA2MOlqRUB6jf8Ow93bMfkAUD3OwT8nNnAX3Gz1b9k9NtqgSFbFGADfWuLz43GZYFG6dJ5Dn1YAnxHQ680myQFIrCG1so3wrd3ah2KbK68lY0TP52WPl-Wh6O37lhBvIk",
  photographer:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD9xVq9mJZwUXJGzTsArBj_J4j4M7QquTepuolMz2Lf-37D2cuXrduf_IT02vmC4OweXmk7jRX15mvnEOTVkSKNK_JVfFABukUHp8HyND4kPZfQ46y-IvBxKNlzQe0VDuxDD6x_3nmvE1DMJXh2_zoYV8h8SAhyOT9W89k1aNS_ZRUQ3zQNk4fijMtqHYQ-b0JC0SUAdQPElqQXKj3wLkFPq_9hT56QzFVAjhyXKSl_05uIpDHpyPeUqxzxCFiG3Us0Nqs3P_BEtw0",
  cta: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZANIVI6l5drZpiWnyCseWWjXb6l7J6_xo_iNB5u89J15ZJOyXS_5SFyLOOq39M9YxOfvCxmInhg55up_Nwy25JnNxIWzO70_5tio2Vy-3Ft7Ks81-tE-H-xD_C4qtNTYnCH2rElMZeDIl3W7_ueDTOgaA2BEg2pOea5y9z4bMud4enfGUa9T842qeRu1oiaG_vwXjuTTDTkqg5BffGolZDlptIg9fdzGat1kzcq4rd9GKMKD5SnFHcqs6rGxaTMcfLrHmgIZYf4E",
};

export type LandingImages = Record<LandingImageKey, string>;

export const DEFAULT_LANDING_GRAYSCALE: Record<LandingImageKey, boolean> = {
  hero: true,
  festivales: true,
  recitales: true,
  teatro: true,
  deportes: true,
  photographer: true,
  cta: true,
};

export type LandingGrayscale = Record<LandingImageKey, boolean>;

/** Encuadre del hero: porcentaje 0–100 (object-position). */
export interface LandingHeroFocus {
  x: number;
  y: number;
}

export const DEFAULT_LANDING_HERO_FOCUS: LandingHeroFocus = {
  x: 50,
  y: 50,
};

export interface LandingCopy {
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  photographerEyebrow: string;
  photographerTitle: string;
  photographerBody: string;
  photographerCta: string;
  finalCtaTitleLine1: string;
  finalCtaTitleLine2: string;
  finalCtaButton: string;
}

export const DEFAULT_LANDING_COPY: LandingCopy = {
  heroTitleLine1: "Estuviste ahí.",
  heroTitleLine2: "Nosotros lo capturamos.",
  heroSubtitle:
    "Encontrá las fotografías de los momentos que viviste en recitales, festivales, obras y eventos de la mano de profesionales.",
  heroCtaPrimary: "Explorar eventos",
  heroCtaSecondary: "Soy fotografx",
  photographerEyebrow: "Alianza",
  photographerTitle: "Un espacio para la mirada profesional.",
  photographerBody:
    "¿Sos fotografx? Sumate y publicá tus galerías de eventos para llegar a quien estuvo en la platea.",
  photographerCta: "Sumarme como fotografx",
  finalCtaTitleLine1: "Reviví los momentos que",
  finalCtaTitleLine2: "merecen ser recordados.",
  finalCtaButton: "Explorar eventos ahora",
};

export interface LandingSettings {
  images: LandingImages;
  grayscale: LandingGrayscale;
  heroFocus: LandingHeroFocus;
  copy: LandingCopy;
  featuredCategories: LandingFeaturedCategory[];
  featuredEventIds: string[];
  testimonials: LandingTestimonial[];
  faq: LandingFaqItem[];
}

export interface LandingTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  sortOrder: number;
}

export interface LandingFaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export const DEFAULT_LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    id: "mariana-v",
    quote:
      "Encontrar la foto exacta de mi primer Luna Park con una calidad increíble fue algo que no esperaba. EstuveAhí capturó la emoción que sentí esa noche.",
    name: "Mariana V.",
    role: "Asistente a eventos",
    sortOrder: 0,
  },
  {
    id: "julian-r",
    quote:
      "Como fotografx documental, esta plataforma me permite llegar a quienes realmente aprecian mi trabajo y monetizar cada disparo sin complicaciones técnicas.",
    name: "Julián R.",
    role: "Fotografx profesional",
    sortOrder: 1,
  },
];

export const DEFAULT_LANDING_FAQ: LandingFaqItem[] = [
  {
    id: "buscar-fotos",
    question: "¿Cómo busco mis fotos?",
    answer:
      "Solo necesitás ingresar a nuestra sección de búsqueda y filtrar por el nombre del evento, la fecha o el lugar. Si el evento fue reciente, aparecerá en la página principal como destacado.",
    sortOrder: 0,
  },
  {
    id: "formato-archivos",
    question: "¿En qué formato recibo los archivos?",
    answer:
      "El fotografx te envía la imagen en alta resolución (JPEG u otro formato acordado) directamente, sin marca de agua, una vez confirmado el pago entre ustedes.",
    sortOrder: 1,
  },
  {
    id: "comision",
    question: "¿EstuveAhí se queda con una comisión?",
    answer:
      "No. En esta etapa la plataforma no cobra comisión por venta: el 100 % del acuerdo es para el fotografx. Vos pagás directamente a quien tomó la foto.",
    sortOrder: 2,
  },
  {
    id: "publicar-fotografx",
    question: "¿Soy fotografx, cómo puedo publicar?",
    answer:
      'Hacé clic en "Soy fotografx", completá tu perfil y empezá a subir tus galerías de eventos.',
    sortOrder: 3,
  },
];

export type LandingCategoryLayout = "wide" | "narrow";

export interface LandingFeaturedCategory {
  id: string;
  title: string;
  subtitle: string;
  /** Imagen propia subida desde admin */
  imageUrl?: string | null;
  /** Imagen del set legacy (hero, festivales, etc.) */
  imageKey?: LandingImageKey | null;
  eventCategory?: string | null;
  href?: string | null;
  layout: LandingCategoryLayout;
  grayscale: boolean;
  sortOrder: number;
}

export const DEFAULT_FEATURED_CATEGORIES: LandingFeaturedCategory[] = [
  {
    id: "festivales",
    title: "Festivales",
    subtitle: "248 galerías activas",
    imageKey: "festivales",
    eventCategory: "festival",
    layout: "wide",
    grayscale: true,
    sortOrder: 0,
  },
  {
    id: "recitales",
    title: "Recitales",
    subtitle: "Boutique & Arena",
    imageKey: "recitales",
    eventCategory: "concert",
    layout: "narrow",
    grayscale: true,
    sortOrder: 1,
  },
  {
    id: "teatro",
    title: "Teatro",
    subtitle: "Obras & Musicales",
    imageKey: "teatro",
    eventCategory: "theater",
    layout: "narrow",
    grayscale: true,
    sortOrder: 2,
  },
  {
    id: "deportes",
    title: "Deportes",
    subtitle: "Fútbol, Tenis & más",
    imageKey: "deportes",
    eventCategory: "sports",
    layout: "wide",
    grayscale: true,
    sortOrder: 3,
  },
];
