"use server";

import { createClient } from "@/lib/supabase/server";

// Lo que se puede decidir sobre un candidato (PM-36). Mismo texto que interests.decision.
export type Decision = "interesa" | "descarta";

export type ResultadoValoracion = { match: boolean } | { error: string };

const FORMATO_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Botones «Me interesa» y «Descartar» de cada tarjeta de /candidatos (PM-36).
// La base de datos (función valorar, migración 0006) guarda la decisión y dice si hay
// match. Decisión del PO: no se puede cambiar de opinión, así que si ya se había
// valorado a esa persona se queda lo primero que se eligió.
export async function valorarCandidato(
  otroUsuario: string,
  decision: Decision,
): Promise<ResultadoValoracion> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (typeof data?.claims?.sub !== "string") {
    return { error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
  }

  // Lo que llega del navegador no es de fiar: se comprueba otra vez.
  if (typeof otroUsuario !== "string" || !FORMATO_ID.test(otroUsuario)) {
    return { error: "No hemos encontrado a esa persona. Recarga la página." };
  }
  if (decision !== "interesa" && decision !== "descarta") {
    return { error: "No se pudo guardar tu decisión. Inténtalo de nuevo." };
  }

  const { data: hayMatch, error } = await supabase.rpc("valorar", {
    otro_usuario: otroUsuario,
    decision,
  });
  if (error || typeof hayMatch !== "boolean") {
    return { error: "No se pudo guardar tu decisión. Inténtalo de nuevo." };
  }

  return { match: hayMatch };
}
