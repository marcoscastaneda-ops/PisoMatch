"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Lo que el formulario necesita saber después de enviarlo.
export type EstadoLogin = {
  // Error de cada campo, para señalar cuál falta o está mal escrito.
  errores: { email?: string; password?: string };
  // Error general: credenciales incorrectas o Supabase no responde.
  mensaje?: string;
  // Se devuelve para no obligar a escribir el correo otra vez.
  email: string;
};

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mismo mensaje si falla el correo o la contraseña: así nadie puede averiguar
// qué correos tienen cuenta en PisoMatch.
const CREDENCIALES_INCORRECTAS = "Correo o contraseña incorrectos";

export async function iniciarSesion(
  _estadoAnterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Validamos en el servidor: lo que llega del navegador no es de fiar.
  const errores: EstadoLogin["errores"] = {};
  if (!email) {
    errores.email = "Escribe tu correo electrónico.";
  } else if (!FORMATO_EMAIL.test(email)) {
    errores.email = "El correo no es válido. Revisa que tenga la forma nombre@ejemplo.com.";
  }
  if (!password) {
    errores.password = "Escribe tu contraseña.";
  }
  if (errores.email || errores.password) {
    return { errores, email };
  }

  // Si el correo y la contraseña son correctos, Supabase guarda la sesión en cookies.
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "invalid_credentials") {
      return { errores: {}, mensaje: CREDENCIALES_INCORRECTAS, email };
    }
    return {
      errores: {},
      mensaje: "No hemos podido iniciar sesión. Inténtalo de nuevo en unos minutos.",
      email,
    };
  }

  // redirect() corta la ejecución, así que va al final.
  redirect("/perfil");
}

// Botón «Cerrar sesión» de la barra superior.
export async function cerrarSesion() {
  const supabase = await createClient();
  // scope "local": cierra la sesión solo en este dispositivo, no en los demás.
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}
