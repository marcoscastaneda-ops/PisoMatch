"use client";

import { useActionState } from "react";
import { aceptarPrivacidad } from "./actions";
import { CasillaPrivacidad } from "./casilla-privacidad";

// Para perfiles creados antes de PM-24 que aún no han aceptado la política.
export function FormularioPrivacidad({ nombre }: { nombre: string }) {
  const [estado, accion, guardando] = useActionState(aceptarPrivacidad, null);

  return (
    <form action={accion} className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Hola, {nombre}
        </h2>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Antes de seguir, lee y acepta cómo usamos tus datos.
        </p>
      </div>

      <CasillaPrivacidad />

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
        {guardando ? "Guardando…" : "Aceptar y continuar"}
      </button>
    </form>
  );
}
