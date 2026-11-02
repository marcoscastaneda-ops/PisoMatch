"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Lo que el formulario necesita saber después de enviarlo.
export type EstadoRegistro = {
  // Error de cada campo, para señalar cuál hay que corregir.
  errores: { email?: string; password?: string };
  // El correo ya tiene cuenta: se muestra un aviso con enlace a /login.
  yaRegistrado?: boolean;
  // Error general (por ejemplo, Supabase no responde).
  mensaje?: string;
  // Se devuelve para no obligar a escribir el correo otra vez.
  email: string;
};

const LONGITUD_MINIMA_PASSWORD = 8;
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registrarse(
  _estadoAnterior: EstadoRegistro,
  formData: FormData,
): Promise<EstadoRegistro> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Validamos en el servidor: lo que llega del navegador no es de fiar.
  const errores: EstadoRegistro["errores"] = {};
  if (!email) {
    errores.email = "Escribe tu correo electrónico.";
  } else if (!FORMATO_EMAIL.test(email)) {
    errores.email = "El correo no es válido. Revisa que tenga la forma nombre@ejemplo.com.";
  }
  if (!password) {
    errores.password = "Escribe una contraseña.";
  } else if (password.length < LONGITUD_MINIMA_PASSWORD) {
    errores.password = `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`;
  }
  if (errores.email || errores.password) {
    return { errores, email };
  }

  // Como «Confirm email» está desactivado en Supabase, signUp crea la cuenta
  // y deja la sesión iniciada (guardada en cookies) en el mismo paso.
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    switch (error.code) {
      case "user_already_exists":
      case "email_exists":
        return { errores: {}, yaRegistrado: true, email };
      case "email_address_invalid":
        return { errores: { email: "Este correo no se puede usar. Prueba con otro." }, email };
      case "weak_password":
        return {
          errores: { password: "La contraseña es demasiado débil. Prueba con otra más segura." },
          email,
        };
      default:
        return {
          errores: {},
          mensaje: "No hemos podido crear tu cuenta. Inténtalo de nuevo en unos minutos.",
          email,
        };
    }
  }

  // El registro no crea la fila de profiles: se crea en /perfil (PM-12 y PM-24).
  // redirect() corta la ejecución, así que va al final.
  redirect("/perfil");
}
