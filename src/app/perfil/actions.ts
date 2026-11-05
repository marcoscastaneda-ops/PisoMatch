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
  type ValoresDatos,
} from "./datos-perfil";

// Lo que devuelve cada acción al formulario: null si todo fue bien, o un mensaje de error.
export type EstadoFormulario = { error: string } | null;

// Lo que devuelve «Tus datos» (PM-13): errores junto a cada campo y lo que escribió el
// usuario, para no perderlo si hay errores (React vacía el formulario al enviarlo).
export type EstadoDatos = {
  error?: string;
  errores?: ErroresDatos;
  valores?: ValoresDatos;
  guardado?: boolean;
} | null;

// Lo que devuelve «Tu foto»: un mensaje de error o que se ha guardado.
export type EstadoFoto = { error?: string; guardado?: boolean } | null;

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

// Página de perfil: cambia el rol del usuario con sesión.
export async function cambiarRol(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, userId } = await usuarioConSesion();
  if (!userId) {
    return { error: ERROR_SESION };
  }

  const rol = formData.get("rol");
  if (!esRolValido(rol)) {
    return { error: "Elige si buscas habitación o tienes una libre." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ rol })
    .eq("id", userId);

  if (error) {
    return { error: "No se pudo cambiar el rol. Inténtalo de nuevo." };
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

// PM-13 · «Tus datos»: guarda nombre, descripción, presupuesto, zona y fecha de entrada.
export async function guardarDatos(
  _estadoAnterior: EstadoDatos,
  formData: FormData,
): Promise<EstadoDatos> {
  const valores = leerValoresDatos(formData);

  const { supabase, userId } = await usuarioConSesion();
  if (!userId) {
    return { error: ERROR_SESION, valores };
  }

  // Las mismas comprobaciones que hace el navegador, repetidas aquí.
  const { errores, datos } = validarDatosPerfil(valores);
  if (!datos) {
    return { errores, valores };
  }

  const { error } = await supabase.from("profiles").update(datos).eq("id", userId);

  if (error) {
    return { error: "No se pudieron guardar tus datos. Inténtalo de nuevo.", valores };
  }

  refresh();
  return { guardado: true };
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
  "Aún no se pueden subir fotos: falta configurar el almacenamiento. Tus demás datos sí se guardan.";

// PM-13 · «Tu foto»: sube la foto a <id del usuario>/<fecha-hora>.jpg|png, guarda esa ruta
// en profiles.foto_url y borra la foto anterior.
export async function cambiarFoto(
  _estadoAnterior: EstadoFoto,
  formData: FormData,
): Promise<EstadoFoto> {
  const { supabase, userId } = await usuarioConSesion();
  if (!userId) {
    return { error: ERROR_SESION };
  }

  const archivo = formData.get("foto");
  const errorFoto = validarFoto(archivo instanceof File ? archivo : null);
  if (errorFoto || !(archivo instanceof File)) {
    return { error: errorFoto ?? "Elige una foto." };
  }

  const extension = await extensionReal(archivo);
  if (!extension) {
    return { error: "La foto debe ser JPG o PNG." };
  }

  // Ruta de la foto anterior, para borrarla al final.
  const { data: perfil } = await supabase
    .from("profiles")
    .select("foto_url")
    .eq("id", userId)
    .maybeSingle();
  const rutaAnterior = perfil?.foto_url ?? null;

  // Nombre nuevo cada vez: así el navegador no enseña la foto vieja que tenga guardada.
  const ruta = `${userId}/${Date.now()}.${extension}`;
  const { error: errorSubida } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(ruta, archivo, {
      contentType: extension === "png" ? "image/png" : "image/jpeg",
      upsert: false,
    });

  if (errorSubida) {
    if (faltaElBucket(errorSubida)) {
      return { error: ERROR_SIN_BUCKET };
    }
    return { error: "No se pudo subir la foto. Inténtalo de nuevo." };
  }

  const { error: errorPerfil } = await supabase
    .from("profiles")
    .update({ foto_url: ruta })
    .eq("id", userId);

  if (errorPerfil) {
    // No dejamos archivos sueltos si no se pudo apuntar a la foto nueva.
    await supabase.storage.from(BUCKET_FOTOS).remove([ruta]);
    return { error: "No se pudo guardar la foto. Inténtalo de nuevo." };
  }

  // Borra la foto anterior (solo si es del propio usuario). Si falla, no es grave:
  // la nueva ya está guardada.
  if (rutaAnterior && rutaAnterior !== ruta && rutaAnterior.startsWith(`${userId}/`)) {
    await supabase.storage.from(BUCKET_FOTOS).remove([rutaAnterior]);
  }

  refresh();
  return { guardado: true };
}
