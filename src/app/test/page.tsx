import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cargarPreguntas, perfilEstaCompleto, yaHizoElTest } from "./datos";
import { CuestionarioTest } from "./cuestionario-test";

export const metadata: Metadata = {
  title: "Test de convivencia · PisoMatch",
};

export default function PaginaTest() {
  return (
    <main className="flex flex-1 justify-center bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Test de convivencia
        </h1>
        <Suspense fallback={<p className="text-sm text-zinc-500">Cargando el test…</p>}>
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
      <p className="text-sm text-red-600">
        No se pudo cargar el test. Recarga la página para intentarlo de nuevo.
      </p>
    );
  }

  // 3. Ya hizo el test → aviso, sin dejar repetirlo (editar respuestas es PM-21).
  if (hecho) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-zinc-600 dark:text-zinc-400">
          Ya has completado el test de convivencia. Tus respuestas están guardadas.
        </p>
        <Link href="/perfil" className="self-start font-medium text-zinc-900 underline dark:text-zinc-50">
          Volver a mi perfil
        </Link>
      </div>
    );
  }

  if (preguntas.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Todavía no hay preguntas en el test. Vuelve a intentarlo más tarde.
      </p>
    );
  }

  // 4. Todo listo → el test, una pregunta cada vez.
  return <CuestionarioTest preguntas={preguntas} />;
}
