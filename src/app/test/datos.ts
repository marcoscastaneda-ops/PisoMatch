import "server-only";
import { createClient } from "@/lib/supabase/server";
import { esRolValido } from "@/app/perfil/roles";

type ClienteSupabase = Awaited<ReturnType<typeof createClient>>;

// Una pregunta del test, lista para enseñar. El valor de cada opción es su posición + 1.
export type Pregunta = {
  id: number;
  bloque: string; // nombre del bloque que ve el usuario, ej. «Tu rutina»
  texto: string;
  opciones: string[];
  imprescindibleSugerida: boolean; // muestra «Suele ser imprescindible» (PM-16)
};

// Nombres de los bloques (la columna questions.bloque guarda la clave corta).
const NOMBRES_BLOQUE: Record<string, string> = {
  rutina: "Tu rutina",
  habitos: "Hábitos en casa",
  social: "Vida social y convivencia",
};

// Perfil completo = igual que en /perfil: tiene fila en profiles, rol válido
// y ha aceptado la política de privacidad. Devuelve null si no se pudo comprobar.
export async function perfilEstaCompleto(
  supabase: ClienteSupabase,
  userId: string,
): Promise<boolean | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("rol, acepta_privacidad")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  return !!data && esRolValido(data.rol) && data.acepta_privacidad === true;
}

// ¿El usuario ya guardó respuestas del test? Devuelve null si no se pudo comprobar.
export async function yaHizoElTest(
  supabase: ClienteSupabase,
  userId: string,
): Promise<boolean | null> {
  const { count, error } = await supabase
    .from("answers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) return null;
  return (count ?? 0) > 0;
}

// Las preguntas en el orden del test. Devuelve null si no se pudieron cargar.
export async function cargarPreguntas(supabase: ClienteSupabase): Promise<Pregunta[] | null> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, orden, bloque, texto, opciones, imprescindible_sugerida")
    .order("orden", { ascending: true });

  if (error || !data) return null;

  return data.map((fila) => ({
    id: fila.id,
    bloque: NOMBRES_BLOQUE[fila.bloque] ?? fila.bloque,
    texto: fila.texto,
    opciones: Array.isArray(fila.opciones) ? fila.opciones.map(String) : [],
    imprescindibleSugerida: fila.imprescindible_sugerida === true,
  }));
}
