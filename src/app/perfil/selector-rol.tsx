"use client";

import { useActionState } from "react";
import { cambiarRol } from "./actions";
import { OpcionesRol } from "./opciones-rol";
import type { Rol } from "./roles";

// En el perfil: muestra el rol actual marcado y permite cambiarlo.
export function SelectorRol({ rolActual }: { rolActual: Rol }) {
  const [estado, accion, guardando] = useActionState(cambiarRol, null);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <OpcionesRol rolActual={rolActual} />

      {estado?.error && (
        <p role="alert" className="text-sm text-red-600">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
