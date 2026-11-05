import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Aviso, COLUMNA_ESTRECHA, ENLACE, PAGINA, SEPARACION_SECCIONES, TEXTO_SUAVE, TITULO } from "@/components/ui";
import { cargarPreguntas, perfilEstaCompleto, yaHizoElTest } from "./datos";
import { CuestionarioTest } from "./cuestionario-test";

export const metadata: Metadata = {
  title: "Test de convivencia · PisoMatch",
};

export default function PaginaTest() {
  return (
    <main className={PAGINA}>
      <div className={`${COLUMNA_ESTRECHA} ${SEPARACION_SECCIONES}`}>
        <h1 className={TITULO}>
          Test de convivencia
        </h1>
        <Suspense fallback={<p className={TEXTO_SUAVE}>Cargando el test…</p>}>
          <ContenidoTest />
        </Suspense>
      </div>
    </main>
  );
}

// Decide qué enseñar según la sesión, el perfil y si ya hizo el test.
async function ContenidoTest() {
  // Depende de la sesión del usuario: generar en cada visita, nunca por adelantado.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  // 1. Sin sesión → a iniciar sesión.
  if (!userId) {
    redirect("/login");
  }

  // 2. Perfil sin completar → a /perfil, que muestra la bienvenida o la privacidad.
  const perfilCompleto = await perfilEstaCompleto(supabase, userId);
  if (perfilCompleto === false) {
    redirect("/perfil");
  }

  const [hecho, preguntas] = await Promise.all([
    yaHizoElTest(supabase, userId),
    cargarPreguntas(supabase),
  ]);

  if (perfilCompleto === null || hecho === null || !preguntas) {
    return (
      <Aviso tipo="error">
        No se pudo cargar el test. Recarga la página para intentarlo de nuevo.
      </Aviso>
    );
  }

  // 3. Ya hizo el test → aviso, sin dejar repetirlo (editar respuestas es PM-21).
  if (hecho) {
    return (
      <div className="flex flex-col gap-4">
        <Aviso tipo="exito">
          Ya has completado el test de convivencia. Tus respuestas están guardadas.
        </Aviso>
        <Link href="/perfil" className={`${ENLACE} self-start`}>
          Volver a mi perfil
        </Link>
      </div>
    );
  }

  if (preguntas.length === 0) {
    return (
      <p className="text-texto-suave">
        Todavía no hay preguntas en el test. Vuelve a intentarlo más tarde.
      </p>
    );
  }

  // 4. Todo listo → el test, una pregunta cada vez.
  return <CuestionarioTest preguntas={preguntas} />;
}
