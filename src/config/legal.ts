/**
 * Datos del titular — completar antes de publicar en producción.
 * Revisión por asesor legal argentino recomendada.
 */
export const legalConfig = {
  lastUpdated: "16 de junio de 2026",
  responsible: {
    businessName: "[Razón social o nombre del titular]",
    cuit: "[CUIT]",
    address: "[Domicilio legal], [Ciudad], [Provincia], República Argentina",
    email: "legal@estuveahi.com",
    supportEmail: "hola@estuveahi.com",
    jurisdiction: "Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires",
  },
  /** N.º de inscripción en el Registro Nacional de Bases de Datos (AAIP), si corresponde */
  aaipRegistration: "[N.º de registro AAIP — completar tras inscripción]",
} as const;

export const legalDocuments = [
  {
    slug: "terminos-y-condiciones",
    title: "Términos y Condiciones",
    description: "Reglas de uso de la plataforma para todos los usuarios.",
  },
  {
    slug: "privacidad",
    title: "Política de Privacidad",
    description: "Cómo tratamos tus datos personales (Ley 25.326).",
  },
  {
    slug: "cookies",
    title: "Política de Cookies",
    description: "Uso de cookies y tecnologías similares.",
  },
  {
    slug: "aviso-legal",
    title: "Aviso Legal",
    description: "Identificación del titular y datos de contacto.",
  },
  {
    slug: "propiedad-intelectual",
    title: "Propiedad Intelectual",
    description: "Derechos sobre fotografías, marcas y contenidos.",
  },
  {
    slug: "defensa-del-consumidor",
    title: "Defensa del Consumidor",
    description: "Información para compradores según Ley 24.240.",
  },
] as const;
