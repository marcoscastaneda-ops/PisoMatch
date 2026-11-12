import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Aviso, COLUMNA_ESTRECHA, ENLACE, PAGINA, SEPARACION_SECCIONES, TEXTO_SUAVE, TITULO } from "@/components/ui";
import { cargarPreguntas } from "../datos";
import { cargarMisRespuestas } from "./datos";
import { FormularioRespuestas, type PreguntaConRespuesta } from "./formulario-respuestas";

export const metadata: Metadata = {
  title: "Mis respuestas · PisoMatch",
};

// PM-21 · Ver y cambiar las respuestas del test de convivencia.
export default function PaginaMisRespuestas() {
  return (
    <main className={PAGINA}>
      <div className={`${COLUMNA_ESTRECHA} ${SEPARACION_SECCIONES}`}>
        <section className="flex flex-col gap-2">
          <h1 className={TITULO}>Mis respuestas</h1>
          <p className="text-texto-suave">
            Revisa lo que contestaste en el test de convivencia y cámbialo si ya no te representa.
          </p>
        </section>
        <Suspense fallback={<p className={TEXTO_SUAVE}>Cargando tus respuestas…</p>}>
          <ContenidoRespuestas />
        </Suspense>
      </div>
    </main>
  );
}

async function ContenidoRespuestas() {
  // Depende de la sesión del usuario: generar en cada visita, nunca por adelantado.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  // 1. Sin sesión → a iniciar sesión.
  if (!userId) {
    redirect("/login");
  }

  const [preguntas, guardadas] = await Promise.all([
    cargarPreguntas(supabase),
    cargarMisRespuestas(supabase, userId),
  ]);

  if (!preguntas || !guardadas) {
    return (
      <Aviso tipo="error">
        No se pudieron cargar tus respuestas. Recarga la página para intentarlo de nuevo.
      </Aviso>
    );
  }

  // 2. Sin test hecho → al test (que, si falta el perfil, lleva a /perfil).
  if (guardadas.size === 0) {
    redirect("/test");
  }

  // 3. Las preguntas con lo que eligió el usuario, en el orden del test.
  const lista: PreguntaConRespuesta[] = preguntas.flatMap((pregunta) => {
    const guardada = guardadas.get(pregunta.id);
    return guardada ? [{ ...pregunta, ...guardada }] : [];
  });

  return (
    <>
      <FormularioRespuestas preguntas={lista} />
      <Link href="/perfil" className={`${ENLACE} self-start`}>
        Volver a mi perfil
      </Link>
    </>
  );
}
