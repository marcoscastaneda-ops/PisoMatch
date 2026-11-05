import "server-only";
import { createClient } from "@/lib/supabase/server";
import { normalizarImportancia, type Importancia } from "../importancia";

type ClienteSupabase = Awaited<ReturnType<typeof createClient>>;

// Lo que el usuario guardó para una pregunta, listo para enseñar y editar.
export type RespuestaGuardada = {
  valor: number; // posición de la opción elegida (1 a 4)
  importancia: Importancia;
  imprescindible: boolean;
};

// Respuestas del usuario, por id de pregunta. Devuelve null si no se pudieron cargar.
// RLS (migración 0001) ya impide leer las de otra persona; el filtro por user_id es por claridad.
export async function cargarMisRespuestas(
  supabase: ClienteSupabase,
  userId: string,
): Promise<Map<number, RespuestaGuardada> | null> {
  const { data, error } = await supabase
    .from("answers")
    .select("question_id, respuesta, importancia, imprescindible")
    .eq("user_id", userId);

  if (error || !data) return null;

  return new Map(
    data.map((fila) => [
      fila.question_id,
      {
        valor: fila.respuesta,
        // Tests de antes de PM-14 / PM-16: importancia vacía → «algo», imprescindible vacía → false.
        importancia: normalizarImportancia(fila.importancia),
        imprescindible: fila.imprescindible === true,
      },
    ]),
  );
}
