"use client";

import { useActionState } from "react";
import { aceptarPrivacidad } from "./actions";
import { CasillaPrivacidad } from "./casilla-privacidad";
import { Aviso, BOTON_PRINCIPAL, TITULO } from "@/components/ui";

// Para perfiles creados antes de PM-24 que aún no han aceptado la política.
export function FormularioPrivacidad({ nombre }: { nombre: string }) {
  const [estado, accion, guardando] = useActionState(aceptarPrivacidad, null);

  return (
    <form action={accion} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className={TITULO}>Hola, {nombre}</h2>
        <p className="text-texto-suave">Antes de seguir, lee y acepta cómo usamos tus datos.</p>
      </div>

      <CasillaPrivacidad />

      {estado?.error && (
        <Aviso tipo="error" role="alert">
          {estado.error}
        </Aviso>
      )}

      <button type="submit" disabled={guardando} className={BOTON_PRINCIPAL}>
        {guardando ? "Guardando…" : "Aceptar y continuar"}
      </button>
    </form>
  );
}
