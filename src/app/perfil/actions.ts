"use server";

import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { esRolValido } from "./roles";
import {
  BUCKET_FOTOS,
  NOMBRE_MAX,
  leerValoresDatos,
  validarDatosPerfil,
  validarFoto,
  type ErroresDatos,
} from "./datos-perfil";

// Lo que devuelve cada acción al formulario: null si todo fue bien, o un mensaje de error.
export type EstadoFormulario = { error: string } | null;

// Lo que devuelve «Guardar cambios» en el perfil: un error general, los errores de cada
// campo (y de la foto), o que se ha guardado todo.
export type EstadoPerfil = {
  error?: string;
  errores?: ErroresDatos;
  errorFoto?: string;
  guardado?: boolean;
} | null;

const ERROR_SESION = "Tu sesión ha caducado. Vuelve a iniciar sesión.";

// Devuelve la conexión a Supabase y el id del usuario con sesión (o null si no hay sesión).
// El id sale SIEMPRE de la sesión, nunca del formulario, para que nadie toque perfiles ajenos.
async function usuarioConSesion() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  return { supabase, userId: typeof userId === "string" ? userId : null };
}

// La casilla de privacidad es obligatoria (PM-24). El navegador ya la exige con
// `required`, pero lo comprobamos también aquí: lo que llega del navegador no es de fiar.
function aceptoPrivacidad(formData: FormData) {
  return formData.get("acepta_privacidad") === "on";
}

const ERROR_PRIVACIDAD = "Para empezar, acepta la política de privacidad.";

// Pantalla de bienvenida: crea la fila de profiles con el nombre, el rol y la aceptación.
export async function crearPerfil(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, userId } = await usuarioConSesion();
  if (!userId) {
    return { error: ERROR_SESION };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const rol = formData.get("rol");

  if (!nombre) {
    return { error: "Escribe tu nombre." };
  }
  if (nombre.length > NOMBRE_MAX) {
    return { error: `El nombre puede tener como máximo ${NOMBRE_MAX} caracteres.` };
  }
  if (!esRolValido(rol)) {
    return { error: "Elige si buscas habitación o tienes una libre." };
  }
  if (!aceptoPrivacidad(formData)) {
    return { error: ERROR_PRIVACIDAD };
  }

  const { error } = await supabase
    .from("profiles")
    .insert({ id: userId, nombre, rol, acepta_privacidad: true });

  // 23505 = el perfil ya existía (por ejemplo, doble clic): lo damos por bueno.
  if (error && error.code !== "23505") {
    return { error: "No se pudo guardar tu perfil. Inténtalo de nuevo." };
  }

  refresh();
  return null;
}

// Perfiles creados antes de PM-24: marca que el usuario ha aceptado la privacidad.
export async function aceptarPrivacidad(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, userId } = await usuarioConSesion();
  if (!userId) {
    return { error: ERROR_SESION };
  }

  if (!aceptoPrivacidad(formData)) {
    return { error: ERROR_PRIVACIDAD };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ acepta_privacidad: true })
    .eq("id", userId);

  if (error) {
    return { error: "No se pudo guardar. Inténtalo de nuevo." };
  }

  refresh();
  return null;
}

// Mira los primeros bytes del archivo para confirmar que de verdad es un JPG o un PNG
// (el tipo que dice el navegador se puede falsear cambiando la extensión).
async function extensionReal(archivo: File): Promise<"jpg" | "png" | null> {
  const b = new Uint8Array(await archivo.slice(0, 8).arrayBuffer());
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return "png";
  }
  return null;
}

// El bucket se crea con la migración 0004. Hasta que se ejecute en Supabase, avisamos sin romper nada.
function faltaElBucket(error: { message?: string; code?: string }) {
  return error.code === "NoSuchBucket" || /bucket not found/i.test(error.message ?? "");
}

const ERROR_SIN_BUCKET =
  "Aún no se pueden subir fotos: falta configurar el almacenamiento. Quita la foto nueva para guardar el resto.";

// Perfil · «Guardar cambios»: guarda a la vez el rol, la foto (si se ha elegido una nueva)
// y los datos (nombre, sobre ti, presupuesto, zona y fecha de entrada).
// O se guarda todo o nada: primero se comprueba todo, luego se sube la foto y, si falla
// guardar los datos, se borra la foto recién subida.
// La foto va en <id del usuario>/<fecha-hora>.jpg|png; al cambiarla se borra la anterior.
export async function guardarPerfil(
  _estadoAnterior: EstadoPerfil,
  formData: FormData,
): Promise<EstadoPerfil> {
  const { supabase, userId } = await usuarioConSesion();
  if (!userId) {
    return { error: ERROR_SESION };
  }

  // 1. Comprobar todo antes de guardar nada (las mismas reglas que en el navegador).
  const { errores, datos } = validarDatosPerfil(leerValoresDatos(formData));

  // La foto es opcional: solo se cambia si se ha elegido un archivo.
  const archivo = formData.get("foto");
  const foto = archivo instanceof File && archivo.size > 0 ? archivo : null;
  let errorFoto: string | null = null;
  let extension: "jpg" | "png" | null = null;
  if (foto) {
    errorFoto = validarFoto(foto);
    if (!errorFoto) {
      extension = await extensionReal(foto);
      if (!extension) errorFoto = "La foto debe ser JPG o PNG.";
    }
  }

  if (!datos || errorFoto) {
    return { errores: errores ?? undefined, errorFoto: errorFoto ?? undefined };
  }

  // 2. Subir la foto nueva, si hay. Nombre nuevo cada vez: así el navegador no enseña
  // la foto vieja que tenga guardada.
  let ruta: string | null = null;
  let rutaAnterior: string | null = null;
  if (foto && extension) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("foto_url")
      .eq("id", userId)
      .maybeSingle();
    rutaAnterior = perfil?.foto_url ?? null;

    ruta = `${userId}/${Date.now()}.${extension}`;
    const { error: errorSubida } = await supabase.storage
      .from(BUCKET_FOTOS)
      .upload(ruta, foto, {
        contentType: extension === "png" ? "image/png" : "image/jpeg",
        upsert: false,
      });

    if (errorSubida) {
      return {
        errorFoto: faltaElBucket(errorSubida)
          ? ERROR_SIN_BUCKET
          : "No se pudo subir la foto. Inténtalo de nuevo; no se ha guardado ningún cambio.",
      };
    }
  }

  // 3. Guardar los datos, el rol y (si hay) la ruta de la foto nueva, todo de una vez.
  const { error } = await supabase
    .from("profiles")
    .update(ruta ? { ...datos, foto_url: ruta } : datos)
    .eq("id", userId);

  if (error) {
    // No dejamos archivos sueltos si no se pudo apuntar a la foto nueva.
    if (ruta) await supabase.storage.from(BUCKET_FOTOS).remove([ruta]);
    return { error: "No se pudieron guardar los cambios. Inténtalo de nuevo." };
  }

  // 4. Borrar la foto anterior (solo si es del propio usuario). Si falla, no es grave:
  // la nueva ya está guardada.
  if (ruta && rutaAnterior && rutaAnterior !== ruta && rutaAnterior.startsWith(`${userId}/`)) {
    await supabase.storage.from(BUCKET_FOTOS).remove([rutaAnterior]);
  }

  refresh();
  return { guardado: true };
}
