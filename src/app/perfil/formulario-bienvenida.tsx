"use client";

import { useActionState } from "react";
import { crearPerfil } from "./actions";
import { OpcionesRol } from "./opciones-rol";
import { CasillaPrivacidad } from "./casilla-privacidad";
import { Aviso, BOTON_PRINCIPAL, CAMPO, ETIQUETA, GRUPO_CAMPO, TITULO } from "@/components/ui";

// Pantalla de primera vez: pide nombre, rol y aceptar la privacidad, y crea el perfil.
export function FormularioBienvenida() {
  const [estado, accion, guardando] = useActionState(crearPerfil, null);

  return (
    <form action={accion} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className={TITULO}>¡Bienvenido a PisoMatch!</h2>
        <p className="text-texto-suave">Antes de empezar, cuéntanos un poco sobre ti.</p>
      </div>

      <label className={GRUPO_CAMPO}>
        <span className={ETIQUETA}>¿Cómo te llamas?</span>
        <input
          type="text"
          name="nombre"
          required
          maxLength={60}
          autoComplete="given-name"
          className={CAMPO}
        />
      </label>

      <OpcionesRol />

      <CasillaPrivacidad />

      {estado?.error && (
        <Aviso tipo="error" role="alert">
          {estado.error}
        </Aviso>
      )}

      <button type="submit" disabled={guardando} className={BOTON_PRINCIPAL}>
        {guardando ? "Guardando…" : "Empezar"}
      </button>
    </form>
  );
}
