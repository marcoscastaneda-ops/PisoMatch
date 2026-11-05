import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        PisoMatch
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Compañeros de piso por compatibilidad de convivencia
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/registro"
          className="rounded-lg bg-zinc-900 px-5 py-2 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Crear cuenta
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 px-5 py-2 font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}

