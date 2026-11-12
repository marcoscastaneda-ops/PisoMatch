import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Adónde llevan los botones de la portada según si el usuario ha iniciado sesión (PM-52).
export type EnlacesPortada = {
  conSesion: boolean;
  // «Haz el test en 3 minutos» y la llamada final.
  test: string;
  // «Busco habitación o compañero de piso» y «Tengo una habitación libre».
  // El registro no deja elegir rol (se elige en /perfil), así que no se preselecciona nada.
  caminos: string;
};

export const ENLACES_SIN_SESION: EnlacesPortada = {
  conSesion: false,
  // TODO PM-23: cuando exista el test sin registro, «Haz el test» debe llevar ahí.
  test: "/registro",
  // TODO PM-23: revisar también los caminos cuando exista el test sin registro.
  caminos: "/registro",
};

export const ENLACES_CON_SESION: EnlacesPortada = {
  conSesion: true,
  // /test ya manda a /perfil si el perfil está incompleto.
  test: "/test",
  // En /perfil se elige el rol.
  caminos: "/perfil",
};

// Lee la sesión una sola vez por visita, aunque la usen varias secciones (cache de React).
// Quien la llame debe ir dentro de <Suspense> (Cache Components).
export const enlacesSegunSesion = cache(async (): Promise<EnlacesPortada> => {
  // Depende de la sesión del usuario: generar en cada visita, nunca por adelantado.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ? ENLACES_CON_SESION : ENLACES_SIN_SESION;
});
