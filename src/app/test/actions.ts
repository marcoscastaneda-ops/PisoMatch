"use server";

import { createClient } from "@/lib/supabase/server";
import { cargarPreguntas, perfilEstaCompleto } from "./datos";
import { normalizarImportancia } from "./importancia";
import {
  ERROR_LIMITE_IMPRESCINDIBLES,
  dentroDelLimite,
  leerImprescindible,
} from "./imprescindibles";

// Lo que devuelve la acción al cuestionario: null al empezar, un error o «guardado».
export type EstadoTest = { error: string } | { guardado: true } | null;

// Botón «Finalizar»: guarda las respuestas de todas las preguntas de una sola vez.
// Cada respuesta llega en el campo "respuesta-<id de la pregunta>" con su valor (1, 2, 3…),
// su importancia en "importancia-<id de la pregunta>" (poco / algo / mucho)
// y, solo si está marcada como imprescindible, "imprescindible-<id de la pregunta>".
export async function guardarRespuestas(
  _estadoAnterior: EstadoTest,
  formData: FormData,
): Promise<EstadoTest> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // El id sale SIEMPRE de la sesión, nunca del formulario.
  const userId = data?.claims?.sub;
  if (typeof userId !== "string") {
    return { error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
  }

  if ((await perfilEstaCompleto(supabase, userId)) !== true) {
    return { error: "Completa tu perfil antes de hacer el test." };
  }

  const preguntas = await cargarPreguntas(supabase);
  if (!preguntas || preguntas.length === 0) {
    return { error: "No se pudieron guardar tus respuestas. Inténtalo de nuevo." };
  }

  // Comprobamos aquí también que están todas y que cada valor es una opción real:
  // lo que llega del navegador no es de fiar.
  const filas = [];
  for (const pregunta of preguntas) {
    const valor = Number(formData.get(`respuesta-${pregunta.id}`));
    if (!Number.isInteger(valor) || valor < 1 || valor > pregunta.opciones.length) {
      return { error: "Faltan preguntas por responder." };
    }
    // PM-14: si la importancia falta o no es poco/algo/mucho, se guarda «algo».
    const importancia = normalizarImportancia(formData.get(`importancia-${pregunta.id}`));
    // PM-16: true si la casilla «Es imprescindible para mí» llegó marcada; si no, false.
    const imprescindible = leerImprescindible(formData.get(`imprescindible-${pregunta.id}`));
    filas.push({
      user_id: userId,
      question_id: pregunta.id,
      respuesta: valor,
      importancia,
      imprescindible,
    });
  }

  // PM-16: máximo 3 imprescindibles, aunque alguien manipule la página. Si hay más, no se guarda nada.
  if (!dentroDelLimite(filas.filter((fila) => fila.imprescindible).length)) {
    return { error: ERROR_LIMITE_IMPRESCINDIBLES };
  }

  // Un solo insert con todas las filas: o se guardan todas, o ninguna.
  const { error } = await supabase.from("answers").insert(filas);

  // 23505 = ya había respuestas guardadas (por ejemplo, el test se envió desde otra pestaña).
  if (error?.code === "23505") {
    return { error: "Ya habías completado el test. Tus respuestas anteriores siguen guardadas." };
  }
  if (error) {
    return { error: "No se pudieron guardar tus respuestas. Inténtalo de nuevo." };
  }

  return { guardado: true };
}
