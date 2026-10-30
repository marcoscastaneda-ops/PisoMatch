import { Suspense } from "react";
import { connection } from "next/server";

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

// Comprueba la conexión con el servicio de inicio de sesión de Supabase (/auth/v1/health).
// No lee ninguna tabla, así que funciona sin sesión y respeta las reglas de seguridad (RLS).
// Responde 200 solo si la URL y la clave publishable son correctas.
async function EstadoSupabase() {
  await connection(); // comprobar en cada visita, no al construir la web

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return (
      <p className="text-sm text-amber-600">
        Faltan las claves de Supabase en .env.local ⚠️
      </p>
    );
  }

  const mensajeError = await comprobarSupabase(url, key);
  if (!mensajeError) {
    return <p className="text-sm text-green-600">Conectado a Supabase ✅</p>;
  }

  return (
    <p className="text-sm text-red-600">
      No se pudo conectar con Supabase ❌ ({mensajeError})
    </p>
  );
}

// Devuelve null si Supabase responde bien, o el motivo del fallo.
async function comprobarSupabase(url: string, key: string) {
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    if (res.ok) return null;
    return res.status === 401
      ? "la clave no es válida"
      : `Supabase respondió ${res.status}`;
  } catch {
    return "no se encuentra la URL";
  }
}
