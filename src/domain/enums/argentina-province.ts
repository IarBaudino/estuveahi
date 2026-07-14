export const ArgentinaProvince = {
  CABA: "caba",
  BUENOS_AIRES: "buenos_aires",
  CATAMARCA: "catamarca",
  CHACO: "chaco",
  CHUBUT: "chubut",
  CORDOBA: "cordoba",
  CORRIENTES: "corrientes",
  ENTRE_RIOS: "entre_rios",
  FORMOSA: "formosa",
  JUJUY: "jujuy",
  LA_PAMPA: "la_pampa",
  LA_RIOJA: "la_rioja",
  MENDOZA: "mendoza",
  MISIONES: "misiones",
  NEUQUEN: "neuquen",
  RIO_NEGRO: "rio_negro",
  SALTA: "salta",
  SAN_JUAN: "san_juan",
  SAN_LUIS: "san_luis",
  SANTA_CRUZ: "santa_cruz",
  SANTA_FE: "santa_fe",
  SANTIAGO_DEL_ESTERO: "santiago_del_estero",
  TIERRA_DEL_FUEGO: "tierra_del_fuego",
  TUCUMAN: "tucuman",
} as const;

export type ArgentinaProvince =
  (typeof ArgentinaProvince)[keyof typeof ArgentinaProvince];

export const ARGENTINA_PROVINCE_LABELS: Record<ArgentinaProvince, string> = {
  caba: "CABA",
  buenos_aires: "Buenos Aires",
  catamarca: "Catamarca",
  chaco: "Chaco",
  chubut: "Chubut",
  cordoba: "Córdoba",
  corrientes: "Corrientes",
  entre_rios: "Entre Ríos",
  formosa: "Formosa",
  jujuy: "Jujuy",
  la_pampa: "La Pampa",
  la_rioja: "La Rioja",
  mendoza: "Mendoza",
  misiones: "Misiones",
  neuquen: "Neuquén",
  rio_negro: "Río Negro",
  salta: "Salta",
  san_juan: "San Juan",
  san_luis: "San Luis",
  santa_cruz: "Santa Cruz",
  santa_fe: "Santa Fe",
  santiago_del_estero: "Santiago del Estero",
  tierra_del_fuego: "Tierra del Fuego",
  tucuman: "Tucumán",
};

export const ARGENTINA_PROVINCES = Object.values(ArgentinaProvince);

export const argentinaProvinceValues = [
  ArgentinaProvince.CABA,
  ArgentinaProvince.BUENOS_AIRES,
  ArgentinaProvince.CATAMARCA,
  ArgentinaProvince.CHACO,
  ArgentinaProvince.CHUBUT,
  ArgentinaProvince.CORDOBA,
  ArgentinaProvince.CORRIENTES,
  ArgentinaProvince.ENTRE_RIOS,
  ArgentinaProvince.FORMOSA,
  ArgentinaProvince.JUJUY,
  ArgentinaProvince.LA_PAMPA,
  ArgentinaProvince.LA_RIOJA,
  ArgentinaProvince.MENDOZA,
  ArgentinaProvince.MISIONES,
  ArgentinaProvince.NEUQUEN,
  ArgentinaProvince.RIO_NEGRO,
  ArgentinaProvince.SALTA,
  ArgentinaProvince.SAN_JUAN,
  ArgentinaProvince.SAN_LUIS,
  ArgentinaProvince.SANTA_CRUZ,
  ArgentinaProvince.SANTA_FE,
  ArgentinaProvince.SANTIAGO_DEL_ESTERO,
  ArgentinaProvince.TIERRA_DEL_FUEGO,
  ArgentinaProvince.TUCUMAN,
] as const;

/** Heurística para eventos legacy sin `province` seteada. */
export function cityMatchesProvince(
  city: string | null | undefined,
  province: ArgentinaProvince,
): boolean {
  if (!city) return false;
  const normalized = city
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  if (province === ArgentinaProvince.CABA) {
    return /caba|capital federal|ciudad autonoma|autonomous city/.test(normalized);
  }

  const label = ARGENTINA_PROVINCE_LABELS[province]
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  return normalized.includes(label);
}
