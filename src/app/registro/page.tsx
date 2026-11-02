import type { Metadata } from "next";
import Link from "next/link";
import { FormularioRegistro } from "./formulario-registro";

export const metadata: Metadata = {
  title: "Crear cuenta · PisoMatch",
};

export default function PaginaRegistro() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Crea tu cuenta
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Solo necesitas un correo y una contraseña.
          </p>
        </div>

        <FormularioRegistro />

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline dark:text-zinc-50">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
