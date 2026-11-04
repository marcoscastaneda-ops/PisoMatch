import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cerrarSesion } from "@/app/login/actions";

// Barra de arriba, igual en todas las páginas (se usa en src/app/layout.tsx).
export function BarraSuperior() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        PisoMatch
      </Link>
      {/* Lee la sesión, así que va dentro de <Suspense> (Cache Components). */}
      <Suspense fallback={null}>
        <BotonSesion />
      </Suspense>
    </header>
  );
}

// Con sesión iniciada muestra «Cerrar sesión»; sin sesión, nada.
async function BotonSesion() {
  // Depende de la sesión del usuario: generar en cada visita, nunca por adelantado.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    return null;
  }

  return (
    <form action={cerrarSesion}>
      <button
        type="submit"
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
