"use server";

import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { esRolValido } from "./roles";

// Lo que devuelve cada acción al formulario: null si todo fue bien, o un mensaje de error.
export type EstadoFormulario = { error: string } | null;

const NOMBRE_MAX = 60;

// Devuelve la conexión a Supabase y el id del usuario con sesión (o null si no hay sesión).
// El id sale SIEMPRE de la sesión, nunca del formulario, para que nadie toque perfiles ajenos.
async function usuarioConSesion() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  return { supabase, userId: typeof userId === "string" ? userId : null };
}

// Pantalla de bienvenida: crea la fila de profiles con el nombre y el rol.
export async function crearPerfil(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, userId } = await usuarioConSesion();
  if (!userId) {
    return { error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
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

  // acepta_privacidad no se envía: en la base de datos vale false por defecto (PM-24).
  const { error } = await supabase
    .from("profiles")
    .insert({ id: userId, nombre, rol });

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
    return { error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
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
