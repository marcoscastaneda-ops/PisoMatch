import type { Metadata } from "next";
import Link from "next/link";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = {
  title: "Iniciar sesión · PisoMatch",
};

// Si ya hay sesión, el proxy (src/lib/supabase/proxy.ts) lleva a /perfil antes de llegar aquí.
export default function PaginaLogin() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Inicia sesión
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Entra con tu correo y tu contraseña.
          </p>
        </div>

        <FormularioLogin />

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-zinc-900 underline dark:text-zinc-50">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
