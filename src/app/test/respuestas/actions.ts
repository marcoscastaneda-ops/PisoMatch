"use server";

import { createClient } from "@/lib/supabase/server";
import { cargarPreguntas } from "../datos";
import { normalizarImportancia } from "../importancia";
import {
  ERROR_LIMITE_IMPRESCINDIBLES,
  dentroDelLimite,
  leerImprescindible,
} from "../imprescindibles";
import { cargarMisRespuestas } from "./datos";

// Lo que devuelve la acción al formulario: null al empezar, un error o «guardado».
export type EstadoEdicion = { error: string } | { guardado: true } | null;

const ERROR_GENERICO = "No se pudieron guardar los cambios. Inténtalo de nuevo.";

// Botón «Guardar cambios» de /test/respuestas (PM-21).
// Llegan los mismos campos que en el test: "respuesta-<id>", "importancia-<id>"
// y, solo si está marcada, "imprescindible-<id>".
// Solo ACTUALIZA las respuestas que el usuario ya tiene: no crea filas nuevas.
// La afinidad no se guarda en ningún sitio: la base de datos la calcula al pedirla
// (migración 0005), así que con el nuevo valor ya sale recalculada.
export async function actualizarRespuestas(
  _estadoAnterior: EstadoEdicion,
  formData: FormData,
): Promise<EstadoEdicion> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // El id sale SIEMPRE de la sesión, nunca del formulario.
  const userId = data?.claims?.sub;
  if (typeof userId !== "string") {
    return { error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
  }

  const [preguntas, guardadas] = await Promise.all([
    cargarPreguntas(supabase),
    cargarMisRespuestas(supabase, userId),
  ]);
  if (!preguntas || !guardadas) {
    return { error: ERROR_GENERICO };
  }
  if (guardadas.size === 0) {
    return { error: "Todavía no has hecho el test de convivencia." };
  }

  // Solo las preguntas que ya tienen respuesta guardada: así nunca se crea una fila.
  // Comprobamos otra vez cada valor: lo que llega del navegador no es de fiar.
  const filas = [];
  for (const pregunta of preguntas) {
    if (!guardadas.has(pregunta.id)) continue;

    const valor = Number(formData.get(`respuesta-${pregunta.id}`));
    if (!Number.isInteger(valor) || valor < 1 || valor > pregunta.opciones.length) {
      return { error: "Falta alguna respuesta. Revisa las preguntas e inténtalo de nuevo." };
    }
    filas.push({
      user_id: userId,
      question_id: pregunta.id,
      respuesta: valor,
      importancia: normalizarImportancia(formData.get(`importancia-${pregunta.id}`)),
      imprescindible: leerImprescindible(formData.get(`imprescindible-${pregunta.id}`)),
    });
  }

  // Máximo 3 imprescindibles, igual que en el test. Si hay más, no se guarda nada.
  if (!dentroDelLimite(filas.filter((fila) => fila.imprescindible).length)) {
    return { error: ERROR_LIMITE_IMPRESCINDIBLES };
  }

  // Una sola petición para todas: o se guardan todas, o ninguna.
  // Como todas las filas ya existen (user_id + question_id es único), upsert solo las actualiza.
  // RLS (migración 0001) solo deja tocar filas cuyo user_id es el de la sesión.
  const { error } = await supabase
    .from("answers")
    .upsert(filas, { onConflict: "user_id,question_id" });

  if (error) {
    return { error: ERROR_GENERICO };
  }

  return { guardado: true };
}
