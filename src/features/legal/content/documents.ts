import type { LegalDocumentContent } from "@/features/legal/presentation/components/legal-layout";
import { legalConfig } from "@/config/legal";
import { businessConfig } from "@/config/business";

const { responsible } = legalConfig;

export const termsContent: LegalDocumentContent = {
  title: "Términos y Condiciones de Uso",
  subtitle:
    "Al acceder o utilizar EstuveAhí aceptás estos términos. Si no estás de acuerdo, no utilices la plataforma.",
  sections: [
    {
      id: "objeto",
      title: "1. Objeto y naturaleza del servicio",
      paragraphs: [
        `EstuveAhí (en adelante, la "Plataforma") es operada por ${responsible.businessName}, CUIT ${responsible.cuit}, con domicilio en ${responsible.address} (el "Titular").`,
        "La Plataforma es un servicio en línea de intermediación tecnológica que permite a fotógrafos independientes publicar galerías de eventos y a los asistentes explorar, guardar favoritos y solicitar la compra de fotografías.",
        "EstuveAhí no es vendedor de las fotografías ni parte del contrato de compraventa entre el fotógrafo y el cliente. La Plataforma facilita el contacto, la cotización y el seguimiento de solicitudes; el pago y la entrega del archivo en alta resolución se acuerdan directamente entre las partes.",
        `En la etapa actual de la Plataforma no se cobra comisión por venta al fotógrafo: ${businessConfig.noPlatformFeeMessage} El Titular podrá modificar el modelo comercial en el futuro, con aviso previo razonable a los usuarios.`,
      ],
    },
    {
      id: "aceptacion",
      title: "2. Aceptación y capacidad",
      paragraphs: [
        "El uso de la Plataforma implica la aceptación plena de estos Términos y Condiciones, de la Política de Privacidad, de la Política de Cookies y de los demás documentos legales publicados.",
        "Para registrarte debés ser mayor de 18 años o contar con autorización de tu representante legal. Al registrarte declarás que la información proporcionada es veraz, exacta y actualizada.",
      ],
    },
    {
      id: "cuentas",
      title: "3. Registro, cuentas y roles",
      paragraphs: [
        "Existen distintos tipos de usuarios: clientes (asistentes que buscan fotos), fotógrafos (profesionales que publican galerías) y administradores de la Plataforma.",
        "Sos responsable de mantener la confidencialidad de tus credenciales y de toda actividad realizada desde tu cuenta. Debés notificarnos de inmediato cualquier uso no autorizado.",
        "El Titular puede suspender o cancelar cuentas que infrinjan estos términos, publiquen contenido ilícito, realicen fraude o afecten la seguridad de la Plataforma o de terceros.",
      ],
    },
    {
      id: "uso",
      title: "4. Uso permitido y conductas prohibidas",
      paragraphs: ["Te comprometés a utilizar la Plataforma de forma lícita y de buena fe. Queda expresamente prohibido:"],
      list: [
        "Descargar, capturar, reproducir o redistribuir fotografías publicadas en vista previa o miniatura sin autorización del fotógrafo titular.",
        "Eludir medidas técnicas de protección (marcas de agua, restricciones de acceso, hotlinking no autorizado).",
        "Subir contenido que vulnere derechos de autor, derecho de imagen, marcas o secretos comerciales de terceros.",
        "Publicar material difamatorio, discriminatorio, violento, sexual explícito no consentido o que infrinja la ley argentina.",
        "Utilizar robots, scrapers o herramientas automatizadas para extraer datos o imágenes de la Plataforma.",
        "Suplantar identidades, acosar a otros usuarios o utilizar la Plataforma con fines de spam o phishing.",
        "Intentar acceder sin autorización a áreas restringidas, bases de datos o cuentas de terceros.",
      ],
    },
    {
      id: "fotografos",
      title: "5. Condiciones particulares para fotógrafos",
      paragraphs: [
        "Al registrarte como fotógrafo declarás que tenés capacidad legal para ofrecer tus servicios y que las fotografías que subís fueron tomadas por vos o contás con las autorizaciones necesarias para su publicación y comercialización.",
        "Sos el único responsable de fijar precios, cotizar solicitudes, cobrar al cliente y entregar el archivo en alta resolución por el medio acordado (email, WhatsApp, etc.).",
        "Las vistas previas y miniaturas pueden incluir marcas de agua e identificadores para proteger tus archivos. El cliente solo adquiere derechos sobre la imagen final una vez cerrado el acuerdo de compra con vos, no sobre las previsualizaciones.",
        "Garantizás que contás con las liberaciones o bases legales necesarias respecto del derecho de imagen de las personas retratadas, especialmente en eventos públicos masivos, conforme a la normativa argentina aplicable.",
      ],
    },
    {
      id: "clientes",
      title: "6. Condiciones particulares para clientes",
      paragraphs: [
        "Al solicitar una fotografía proporcionás datos de contacto veraces (nombre, apellido, email y teléfono) para que el fotógrafo pueda cotizarte y coordinar la entrega.",
        "La solicitud no implica obligación de compra hasta que aceptes la cotización y acuerdes el pago con el fotógrafo. Podés cancelar solicitudes pendientes desde tu panel.",
        "Reconocés que las imágenes en galería son vistas previas protegidas y que el uso no autorizado puede constituir infracción a los derechos del fotógrafo.",
      ],
    },
    {
      id: "contenido",
      title: "7. Contenido de usuarios y licencia a la Plataforma",
      paragraphs: [
        "Conservás la titularidad de las fotografías y contenidos que subís. Al publicarlos en EstuveAhí otorgás al Titular una licencia no exclusiva, gratuita, limitada al territorio mundial y por el tiempo en que el contenido permanezca publicado, para alojar, reproducir en formatos optimizados (miniatura, vista previa), mostrar públicamente en la Plataforma y aplicar medidas de seguridad técnicas.",
        "Esta licencia no transfiere la propiedad de las obras ni autoriza al Titular a venderlas en nombre del fotógrafo.",
        "Podés eliminar tus eventos y fotografías; la eliminación razonable de copias en sistemas de respaldo puede demorar un plazo técnico limitado.",
      ],
    },
    {
      id: "pi-plataforma",
      title: "8. Propiedad intelectual de la Plataforma",
      paragraphs: [
        "El nombre EstuveAhí, su diseño, software, bases de datos, textos y elementos distintivos son propiedad del Titular o de sus licenciantes y están protegidos por la Ley 11.723 y normas complementarias.",
        "No se concede ninguna licencia sobre la Plataforma salvo el derecho de uso personal y no comercial conforme a estos términos.",
      ],
    },
    {
      id: "responsabilidad",
      title: "9. Limitación de responsabilidad",
      paragraphs: [
        "La Plataforma se ofrece \"tal cual\" y según disponibilidad. El Titular no garantiza ausencia total de interrupciones o errores, aunque procurará mantener un servicio razonable.",
        "El Titular no responde por: (a) la calidad, licitud o entrega de fotografías ofrecidas por fotógrafos; (b) disputas de pago entre fotógrafo y cliente; (c) daños derivados del incumplimiento entre usuarios; (d) contenido generado por terceros.",
        "En la máxima medida permitida por la ley argentina, la responsabilidad del Titular frente al usuario se limita al monto efectivamente abonado por el usuario a la Plataforma en los últimos doce meses, o a cero si no hubo pagos a la Plataforma.",
        "Nada de lo aquí dispuesto limita derechos irrenunciables del consumidor cuando resulten aplicables conforme a la Ley 24.240.",
      ],
    },
    {
      id: "modificaciones",
      title: "10. Modificaciones y terminación",
      paragraphs: [
        "El Titular puede actualizar estos términos. Los cambios relevantes se publicarán en esta sección con indicación de fecha. El uso continuado tras la publicación implica aceptación, salvo que la ley exija consentimiento expreso adicional.",
        "Podés dejar de usar la Plataforma y solicitar la eliminación de tu cuenta conforme a la Política de Privacidad.",
      ],
    },
    {
      id: "ley",
      title: "11. Ley aplicable y jurisdicción",
      paragraphs: [
        "Estos términos se rigen por las leyes de la República Argentina.",
        `Para cualquier controversia derivada del uso de la Plataforma, las partes se someten a la jurisdicción de los ${responsible.jurisdiction}, con renuncia a cualquier otro fuero que pudiera corresponder, sin perjuicio de los derechos del consumidor residente en Argentina de acudir a los tribunales de su domicilio cuando la normativa lo permita.`,
      ],
    },
  ],
};

export const privacyContent: LegalDocumentContent = {
  title: "Política de Privacidad",
  subtitle:
    "Información sobre el tratamiento de datos personales conforme a la Ley 25.326 de Protección de los Datos Personales y normativa de la Agencia de Acceso a la Información Pública (AAIP).",
  sections: [
    {
      id: "responsable",
      title: "1. Responsable del tratamiento",
      paragraphs: [
        `El responsable del tratamiento de los datos personales es ${responsible.businessName}, CUIT ${responsible.cuit}, domicilio ${responsible.address}.`,
        `Contacto para privacidad: ${responsible.email} | Atención general: ${responsible.supportEmail}`,
        `Registro de bases de datos ante la AAIP: ${legalConfig.aaipRegistration}. El Titular cumplirá con las obligaciones de inscripción y actualización que correspondan según la normativa vigente.`,
      ],
    },
    {
      id: "datos",
      title: "2. Datos que recopilamos",
      paragraphs: ["Podemos tratar las siguientes categorías de datos:"],
      list: [
        "Datos identificatorios y de contacto: nombre, apellido, email, teléfono, foto de perfil (opcional).",
        "Datos de cuenta: credenciales cifradas, rol (cliente, fotógrafo, administrador), historial de sesión.",
        "Datos de fotógrafos: nombre comercial, biografía, redes sociales, portfolio.",
        "Datos de uso: solicitudes de compra, favoritos, mensajes al fotógrafo, eventos visitados.",
        "Datos técnicos: dirección IP, tipo de navegador, dispositivo, logs de seguridad y cookies (ver Política de Cookies).",
        "Datos de analítica agregada: métricas de visitas si habilitás herramientas como Google Analytics.",
      ],
    },
    {
      id: "finalidades",
      title: "3. Finalidades del tratamiento",
      paragraphs: ["Tratamos tus datos para:"],
      list: [
        "Crear y administrar tu cuenta de usuario.",
        "Permitir la publicación de galerías y la solicitud de fotografías.",
        "Poner en contacto a clientes y fotógrafos (compartimos tus datos de contacto con el fotógrafo cuando solicitás una foto).",
        "Gestionar solicitudes, cotizaciones y estados de pedido.",
        "Garantizar la seguridad de la Plataforma, prevenir fraude y cumplir obligaciones legales.",
        "Mejorar el servicio y, con tu consentimiento cuando corresponda, elaborar estadísticas de uso.",
        "Enviar comunicaciones operativas sobre tu cuenta o solicitudes (no spam comercial sin consentimiento).",
      ],
    },
    {
      id: "base-legal",
      title: "4. Base legal y consentimiento",
      paragraphs: [
        "El tratamiento se basa en: (a) la ejecución del servicio solicitado al registrarte; (b) el cumplimiento de obligaciones legales; (c) el interés legítimo del Titular en la seguridad y mejora de la Plataforma; (d) tu consentimiento, cuando sea exigible (por ejemplo, cookies no esenciales o comunicaciones promocionales).",
        "Podés retirar tu consentimiento en cualquier momento sin afectar la licitud del tratamiento previo.",
      ],
    },
    {
      id: "cesion",
      title: "5. Comunicación y cesión de datos",
      paragraphs: [
        "Cuando un cliente solicita una foto, compartimos con el fotógrafo correspondiente los datos de contacto necesarios para cotizar y entregar la imagen.",
        "Utilizamos proveedores tecnológicos que pueden tratar datos en nuestro nombre (encargados del tratamiento), entre ellos Firebase/Google (autenticación y base de datos), Supabase (almacenamiento de imágenes) y Vercel (hosting).",
        "No vendemos datos personales. Solo cederemos información a autoridades competentes cuando exista obligación legal o requerimiento válido.",
      ],
    },
    {
      id: "transferencias",
      title: "6. Transferencias internacionales",
      paragraphs: [
        "Algunos proveedores pueden almacenar datos en servidores ubicados fuera de Argentina. En esos casos adoptamos medidas contractuales y técnicas razonables para proteger tu información conforme a los estándares de la Ley 25.326.",
      ],
    },
    {
      id: "conservacion",
      title: "7. Plazo de conservación",
      paragraphs: [
        "Conservamos los datos mientras mantengas tu cuenta activa o sea necesario para las finalidades indicadas. Tras la baja, podremos retener información el tiempo necesario para obligaciones legales, reclamos o defensa de derechos.",
        "Los logs de seguridad se conservan por plazos limitados y proporcionales.",
      ],
    },
    {
      id: "seguridad",
      title: "8. Seguridad",
      paragraphs: [
        "Aplicamos medidas técnicas y organizativas razonables: cifrado en tránsito (HTTPS), control de acceso, almacenamiento seguro de imágenes, marcas de agua en vistas previas y autenticación protegida.",
        "Ningún sistema es 100 % infalible. Si detectás una vulnerabilidad, contactanos a la brevedad.",
      ],
    },
    {
      id: "derechos",
      title: "9. Derechos de los titulares de datos",
      paragraphs: [
        "Conforme a los arts. 14, 15 y 16 de la Ley 25.326, tenés derecho a acceder, rectificar, actualizar y suprimir tus datos, así como a oponerte u obtener confidencialidad sobre ellos, en los casos que la ley lo prevé.",
        `Para ejercer tus derechos escribinos a ${responsible.email} indicando tu solicitud y acreditando tu identidad. Responderemos en un plazo razonable según la normativa aplicable.`,
        "Si considerás que tus derechos no fueron debidamente atendidos, podés presentar un reclamo ante la Agencia de Acceso a la Información Pública (AAIP): www.argentina.gob.ar/aaip.",
      ],
    },
    {
      id: "menores",
      title: "10. Menores de edad",
      paragraphs: [
        "La Plataforma no está dirigida a menores de 18 años. No recopilamos intencionalmente datos de menores. Si detectamos una cuenta de menor sin autorización, podremos eliminarla.",
      ],
    },
    {
      id: "cambios",
      title: "11. Cambios a esta política",
      paragraphs: [
        "Podemos actualizar esta Política de Privacidad. Publicaremos la versión vigente en esta página con la fecha de última modificación.",
      ],
    },
  ],
};

export const cookiesContent: LegalDocumentContent = {
  title: "Política de Cookies",
  subtitle:
    "Información sobre el uso de cookies y tecnologías similares en estuveahi.com y subdominios asociados.",
  sections: [
    {
      id: "que-son",
      title: "1. ¿Qué son las cookies?",
      paragraphs: [
        "Las cookies son pequeños archivos de texto que el sitio almacena en tu dispositivo al navegar. Permiten recordar preferencias, mantener sesiones y obtener estadísticas de uso.",
        "También podemos usar tecnologías similares (local storage, píxeles de seguimiento) con finalidades equivalentes.",
      ],
    },
    {
      id: "tipos",
      title: "2. Tipos de cookies que utilizamos",
      paragraphs: ["En EstuveAhí podemos utilizar:"],
      list: [
        "Cookies técnicas o estrictamente necesarias: imprescindibles para el login, seguridad y funcionamiento del sitio. No requieren consentimiento.",
        "Cookies de preferencias: recuerdan configuraciones de la interfaz.",
        "Cookies analíticas: miden visitas y comportamiento agregado (por ejemplo Google Analytics 4), para mejorar el servicio. Requieren tu consentimiento cuando la ley así lo exija.",
      ],
    },
    {
      id: "terceros",
      title: "3. Cookies de terceros",
      paragraphs: [
        "Proveedores como Google (Analytics, Firebase), Vercel u otros servicios de infraestructura pueden instalar cookies propias sujetas a sus políticas de privacidad.",
        "Te recomendamos revisar la política de Google: policies.google.com/privacy",
      ],
    },
    {
      id: "gestion",
      title: "4. Cómo gestionar o deshabilitar cookies",
      paragraphs: [
        "Podés configurar tu navegador para bloquear o eliminar cookies. Tené en cuenta que deshabilitar cookies técnicas puede impedir el inicio de sesión o el correcto funcionamiento de la Plataforma.",
        "En Chrome, Firefox, Safari y Edge encontrás opciones en Configuración > Privacidad > Cookies.",
        "Para Google Analytics podés instalar el complemento de inhabilitación: tools.google.com/dlpage/gaoptout",
      ],
    },
    {
      id: "mas-info",
      title: "5. Más información",
      paragraphs: [
        "Para detalles sobre el tratamiento de datos personales vinculados a cookies, consultá nuestra Política de Privacidad.",
        `Consultas: ${responsible.email}`,
      ],
    },
  ],
};

export const legalNoticeContent: LegalDocumentContent = {
  title: "Aviso Legal",
  subtitle: "Datos identificativos del titular del sitio web y condiciones generales de acceso.",
  sections: [
    {
      id: "titular",
      title: "1. Titular del sitio",
      paragraphs: [
        `Denominación: ${responsible.businessName}`,
        `CUIT: ${responsible.cuit}`,
        `Domicilio legal: ${responsible.address}`,
        `Correo electrónico: ${responsible.email}`,
        `Atención al usuario: ${responsible.supportEmail}`,
      ],
    },
    {
      id: "objeto-sitio",
      title: "2. Objeto",
      paragraphs: [
        "El presente sitio web tiene por objeto ofrecer una plataforma digital de conexión entre fotógrafos de eventos y personas interesadas en adquirir fotografías de dichos eventos, conforme a los Términos y Condiciones publicados.",
      ],
    },
    {
      id: "acceso",
      title: "3. Condiciones de acceso",
      paragraphs: [
        "El acceso al sitio es gratuito salvo en lo relativo al costo de la conexión a internet. Algunas funcionalidades requieren registro.",
        "El usuario se compromete a hacer un uso diligente y lícito del sitio, absteniéndose de realizar actos que puedan dañar, inutilizar o sobrecargar el servicio.",
      ],
    },
    {
      id: "pi-sitio",
      title: "4. Propiedad intelectual del sitio",
      paragraphs: [
        "Todos los contenidos del sitio (diseño, código, textos, logotipos, gráficos) son propiedad del Titular o de terceros con licencia, protegidos por la legislación argentina e internacional.",
        "Queda prohibida su reproducción, distribución o transformación sin autorización expresa.",
      ],
    },
    {
      id: "enlaces",
      title: "5. Enlaces externos",
      paragraphs: [
        "El sitio puede contener enlaces a sitios de terceros. El Titular no controla ni responde por el contenido o las políticas de privacidad de dichos sitios.",
      ],
    },
    {
      id: "modificaciones-aviso",
      title: "6. Modificaciones",
      paragraphs: [
        "El Titular se reserva el derecho de modificar el presente Aviso Legal y el contenido del sitio sin previo aviso, debiendo consultarse periódicamente su versión actualizada.",
      ],
    },
  ],
};

export const intellectualPropertyContent: LegalDocumentContent = {
  title: "Propiedad Intelectual y Derechos de Imagen",
  subtitle:
    "Información sobre derechos de autor de las fotografías, derecho de imagen de las personas retratadas y procedimiento de reclamos.",
  sections: [
    {
      id: "autor-fotos",
      title: "1. Titularidad de las fotografías",
      paragraphs: [
        "Las fotografías publicadas en EstuveAhí son obra intelectual protegida por la Ley 11.723 (Ley de Propiedad Intelectual). Salvo prueba en contrario, el fotógrafo que sube la imagen declara ser titular de los derechos de autor o contar con autorización del titular.",
        "La compra o solicitud de una foto no transfiere derechos de autor salvo pacto expreso entre fotógrafo y cliente. En general, el cliente adquiere una licencia de uso personal del archivo en alta resolución en los términos acordados con el fotógrafo.",
      ],
    },
    {
      id: "previews",
      title: "2. Vistas previas y marcas de agua",
      paragraphs: [
        "Las miniaturas y vistas previas incluyen marcas de agua y medidas de protección técnica. Está prohibida su reproducción, captura de pantalla con fines de distribución o cualquier uso que eluda estas medidas sin autorización del titular.",
      ],
    },
    {
      id: "derecho-imagen",
      title: "3. Derecho de imagen (Código Civil y Comercial)",
      paragraphs: [
        "En Argentina, toda persona tiene derecho a la imagen de su rostro y de su cuerpo (art. 53 CCyCN). Su uso con fines publicitarios, comerciales o que pueda causar menoscabo requiere consentimiento, salvo excepciones legales.",
        "En eventos públicos masivos (recitales, partidos, festivales) pueden existir matices según el contexto, la notoriedad del evento y si la imagen se centra en una persona identificable de forma predominante. Es responsabilidad del fotógrafo evaluar si cuenta con base legal para ofrecer comercialmente las imágenes.",
        "Si una persona no desea que su imagen sea comercializada, puede contactar al fotógrafo o a la Plataforma según el procedimiento de reclamos.",
      ],
    },
    {
      id: "garantias-fotografo",
      title: "4. Declaraciones del fotógrafo",
      paragraphs: [
        "Al subir contenido, el fotógrafo garantiza que: (a) es autor o licenciatario autorizado; (b) la publicación no infringe derechos de terceros; (c) dispone de las autorizaciones de imagen que resulten necesarias.",
        "El fotógrafo mantendrá indemne al Titular frente a reclamos de terceros derivados del contenido que publique, en la medida permitida por la ley.",
      ],
    },
    {
      id: "reclamos",
      title: "5. Procedimiento de reclamos por infracción",
      paragraphs: [
        `Si considerás que una fotografía vulnera tus derechos de autor o de imagen, enviá un reclamo a ${responsible.email} con:`,
      ],
      list: [
        "Identificación de la obra o imagen afectada (URL del evento, número de foto).",
        "Datos de contacto del reclamante y, si actuás en representación, acreditación.",
        "Fundamento del reclamo y documentación que lo sustente.",
        "Declaración de buena fe de que el uso no está autorizado.",
      ],
    },
    {
      id: "medidas",
      title: "6. Medidas que podemos adoptar",
      paragraphs: [
        "Ante un reclamo fundado, podremos ocultar temporalmente el contenido, solicitar información al fotógrafo y, en caso de confirmarse la infracción, eliminar la imagen y/o suspender la cuenta infractora.",
        "La Plataforma actúa como intermediario tecnológico y no realiza juicios de valor artístico sobre el contenido, pero colabora con el cumplimiento de la normativa de propiedad intelectual.",
      ],
    },
    {
      id: "marca",
      title: "7. Marca EstuveAhí",
      paragraphs: [
        "El nombre y signos distintivos EstuveAhí son propiedad del Titular. No podés utilizarlos sin autorización previa por escrito.",
      ],
    },
  ],
};

export const consumerContent: LegalDocumentContent = {
  title: "Información al Consumidor",
  subtitle:
    "Información conforme a la Ley 24.240 de Defensa del Consumidor y normativa complementaria de la República Argentina.",
  sections: [
    {
      id: "rol",
      title: "1. Rol de EstuveAhí",
      paragraphs: [
        "EstuveAhí es una plataforma de intermediación tecnológica. No somos el vendedor de las fotografías ni actuamos como agente de cobro en nombre del cliente en la etapa actual del servicio.",
        "El contrato de compraventa de la fotografía en alta resolución se celebra directamente entre el cliente y el fotógrafo independiente. El fotógrafo es el proveedor responsable de la prestación, el precio, la facturación (si correspondiera) y la entrega del archivo.",
      ],
    },
    {
      id: "precios",
      title: "2. Precios y pagos",
      paragraphs: [
        "Los precios publicados en las galerías son fijados por cada fotógrafo. En solicitudes sin precio publicado, el fotógrafo enviará una cotización.",
        `En esta etapa EstuveAhí no cobra comisión al consumidor por el uso de la Plataforma: ${businessConfig.noPlatformFeeMessage}`,
        "Los pagos se realizan por fuera de la Plataforma, por los medios que acuerden cliente y fotógrafo. Verificá siempre la identidad del fotógrafo y conservá comprobantes de pago.",
      ],
    },
    {
      id: "entrega",
      title: "3. Entrega del producto digital",
      paragraphs: [
        "La entrega de la fotografía en alta resolución es responsabilidad exclusiva del fotógrafo. Coordiná formato, plazo y medio de envío antes de abonar.",
        "Una vez que el fotógrafo marque la solicitud como entregada en la Plataforma, se entiende que el archivo fue puesto a disposición según lo acordado entre las partes.",
      ],
    },
    {
      id: "arrepentimiento",
      title: "4. Derecho de revocación / arrepentimiento",
      paragraphs: [
        "La Ley 24.240 y el art. 34 de la Ley 26.361 reconocen al consumidor el derecho de revocar la aceptación en contratos celebrados a distancia, dentro de los diez (10) días corridos desde la contratación o entrega, según corresponda, salvo excepciones legales.",
        "Dado que la compra se concreta directamente con el fotógrafo, el ejercicio de este derecho debe dirigirse prioritariamente al fotógrafo como proveedor del bien digital.",
        "EstuveAhí puede colaborar facilitando el contacto entre las partes, pero no sustituye las obligaciones del fotógrafo frente al consumidor.",
      ],
    },
    {
      id: "reclamos",
      title: "5. Reclamos y garantías",
      paragraphs: [
        "Reclamos por calidad, entrega, reembolso o incumplimiento del fotógrafo: contactá primero al fotógrafo usando los datos de tu solicitud.",
        `Reclamos por el funcionamiento de la Plataforma, privacidad o conductas abusivas en el sitio: ${responsible.supportEmail} o ${responsible.email}.`,
        "Las garantías legales sobre el bien digital aplican respecto del fotógrafo proveedor conforme a la normativa vigente.",
      ],
    },
    {
      id: "autoridad",
      title: "6. Autoridades de aplicación",
      paragraphs: [
        "Los consumidores pueden recurrir a las autoridades de defensa del consumidor de su jurisdicción o al Servicio de Conciliación Previa en las Relaciones de Consumo (COPREC) u organismos provinciales equivalentes.",
        "Información general: www.argentina.gob.ar/produccion/defensadelconsumidor",
      ],
    },
    {
      id: "contenido-ilegal",
      title: "7. Contenido ilícito o engañoso",
      paragraphs: [
        "Si detectás publicaciones fraudulentas, suplantación o contenido que vulnere la ley, reportalo a la Plataforma. Podremos suspender cuentas y colaborar con autoridades cuando corresponda.",
      ],
    },
  ],
};

export const legalContentBySlug: Record<string, LegalDocumentContent> = {
  "terminos-y-condiciones": termsContent,
  privacidad: privacyContent,
  cookies: cookiesContent,
  "aviso-legal": legalNoticeContent,
  "propiedad-intelectual": intellectualPropertyContent,
  "defensa-del-consumidor": consumerContent,
};
