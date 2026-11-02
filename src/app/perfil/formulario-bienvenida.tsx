"use client";

import { useActionState } from "react";
import { crearPerfil } from "./actions";
import { OpcionesRol } from "./opciones-rol";

// Pantalla de primera vez: pide nombre y rol y crea el perfil.
export function FormularioBienvenida() {
  const [estado, accion, guardando] = useActionState(crearPerfil, null);

  return (
    <form action={accion} className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          ¡Bienvenido a PisoMatch!
        </h2>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Antes de empezar, cuéntanos un poco sobre ti.
        </p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          ¿Cómo te llamas?
        </span>
        <input
          type="text"
          name="nombre"
          required
          maxLength={60}
          autoComplete="given-name"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>

      <OpcionesRol />

      {estado?.error && (
        <p role="alert" className="text-sm text-red-600">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {guardando ? "Guardando…" : "Empezar"}
      </button>
    </form>
  );
}
