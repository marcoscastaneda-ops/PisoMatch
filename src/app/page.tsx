import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        PisoMatch
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Compañeros de piso por compatibilidad de convivencia
      </p>
      <Suspense
        fallback={<p className="text-sm text-zinc-500">Comprobando conexión…</p>}
      >
        <EstadoSupabase />
      </Suspense>
    </main>
  );
}

// Comprueba que la web llega a Supabase leyendo la tabla de preguntas.
async function EstadoSupabase() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return (
      <p className="text-sm text-amber-600">
        Faltan las claves de Supabase en .env.local ⚠️
      </p>
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("questions").select("id").limit(1);

  if (error) {
    return (
      <p className="text-sm text-red-600">
        No se pudo conectar con Supabase ❌ ({error.message})
      </p>
    );
  }
  return <p className="text-sm text-green-600">Conectado a Supabase ✅</p>;
}
