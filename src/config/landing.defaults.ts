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

export interface LandingSettings {
  images: LandingImages;
  grayscale: LandingGrayscale;
}
