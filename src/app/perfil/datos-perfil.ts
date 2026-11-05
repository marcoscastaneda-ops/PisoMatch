// Reglas de los datos del perfil (PM-13). Este archivo lo usan a la vez el navegador
// (para avisar antes de enviar) y el servidor (que vuelve a comprobarlo todo, porque
// lo que llega del navegador no es de fiar). Así los mensajes son siempre los mismos.

export const NOMBRE_MAX = 60;
export const DESCRIPCION_MAX = 500;
export const PRESUPUESTO_MAX = 10000; // euros al mes

// Bucket de Supabase Storage creado en supabase/migrations/0004_fotos_perfil.sql.
export const BUCKET_FOTOS = "fotos-perfil";
export const FOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB, igual que el límite del bucket
export const FOTO_TIPOS = ["image/jpeg", "image/png"] as const;

// Los 21 distritos de Madrid. Lo que se guarda en profiles.zona es el texto tal cual,
// así que no cambiar los nombres una vez haya perfiles guardados (se usarán para filtrar matches).
export const DISTRITOS_MADRID = [
  "Arganzuela",
  "Barajas",
  "Carabanchel",
  "Centro",
  "Chamartín",
  "Chamberí",
  "Ciudad Lineal",
  "Fuencarral-El Pardo",
  "Hortaleza",
  "Latina",
  "Moncloa-Aravaca",
  "Moratalaz",
  "Puente de Vallecas",
  "Retiro",
  "Salamanca",
  "San Blas-Canillejas",
  "Tetuán",
  "Usera",
  "Vicálvaro",
  "Villa de Vallecas",
  "Villaverde",
] as const;

export type Distrito = (typeof DISTRITOS_MADRID)[number];

// Lo que escribe el usuario en el formulario «Tus datos», siempre como texto.
export type ValoresDatos = {
  nombre: string;
  descripcion: string;
  presupuesto: string;
  zona: string;
  fecha_entrada: string;
};

export type CampoDatos = keyof ValoresDatos;
export type ErroresDatos = Partial<Record<CampoDatos, string>>;

// Lo que se guarda en la tabla profiles cuando todo es correcto.
export type DatosValidos = {
  nombre: string;
  descripcion: string | null;
  presupuesto: number;
  zona: Distrito;
  fecha_entrada: string | null;
};

export function leerValoresDatos(formData: FormData): ValoresDatos {
  const texto = (campo: CampoDatos) => String(formData.get(campo) ?? "");
  return {
    nombre: texto("nombre"),
    descripcion: texto("descripcion"),
    presupuesto: texto("presupuesto"),
    zona: texto("zona"),
    fecha_entrada: texto("fecha_entrada"),
  };
}

function esDistrito(valor: string): valor is Distrito {
  return (DISTRITOS_MADRID as readonly string[]).includes(valor);
}

// Fecha con el formato del campo de fecha (AAAA-MM-DD) y que exista de verdad (no 31 de febrero).
function esFechaValida(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor);
}

// Comprueba los datos. Devuelve los errores de cada campo, o los datos listos para guardar.
export function validarDatosPerfil(
  valores: ValoresDatos,
): { errores: ErroresDatos; datos: null } | { errores: null; datos: DatosValidos } {
  const errores: ErroresDatos = {};

  const nombre = valores.nombre.trim();
  if (!nombre) {
    errores.nombre = "Escribe tu nombre.";
  } else if (nombre.length > NOMBRE_MAX) {
    errores.nombre = `El nombre puede tener como máximo ${NOMBRE_MAX} caracteres.`;
  }

  const descripcion = valores.descripcion.trim();
  if (descripcion.length > DESCRIPCION_MAX) {
    errores.descripcion = `La descripción puede tener como máximo ${DESCRIPCION_MAX} caracteres.`;
  }

  const presupuestoTexto = valores.presupuesto.trim();
  const presupuesto = Number(presupuestoTexto);
  if (!presupuestoTexto) {
    errores.presupuesto = "El presupuesto es obligatorio.";
  } else if (!/^\d+$/.test(presupuestoTexto)) {
    errores.presupuesto = "Escribe el presupuesto en euros, sin decimales (por ejemplo, 450).";
  } else if (presupuesto > PRESUPUESTO_MAX) {
    errores.presupuesto = `El presupuesto no puede pasar de ${PRESUPUESTO_MAX.toLocaleString("es-ES")} € al mes.`;
  }

  const zona = valores.zona;
  if (!zona) {
    errores.zona = "La zona es obligatoria: elige un distrito.";
  } else if (!esDistrito(zona)) {
    errores.zona = "Elige un distrito de la lista.";
  }

  const fecha = valores.fecha_entrada.trim();
  if (fecha && !esFechaValida(fecha)) {
    errores.fecha_entrada = "La fecha de entrada no es válida.";
  }

  if (Object.keys(errores).length > 0 || !esDistrito(zona)) {
    return { errores, datos: null };
  }

  return {
    errores: null,
    datos: {
      nombre,
      descripcion: descripcion || null,
      presupuesto,
      zona,
      fecha_entrada: fecha || null,
    },
  };
}

// Comprueba el tipo y el tamaño de la foto. Devuelve un mensaje de error, o null si está bien.
export function validarFoto(archivo: File | null): string | null {
  if (!archivo || archivo.size === 0) {
    return "Elige una foto.";
  }
  if (!(FOTO_TIPOS as readonly string[]).includes(archivo.type)) {
    return "La foto debe ser JPG o PNG.";
  }
  if (archivo.size > FOTO_MAX_BYTES) {
    return "La foto no puede pasar de 5 MB.";
  }
  return null;
}
