"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoLogin } from "./actions";
import { Aviso, BOTON_PRINCIPAL, CAMPO, ErrorDeCampo, ETIQUETA, GRUPO_CAMPO } from "@/components/ui";

const estadoInicial: EstadoLogin = { errores: {}, email: "" };

export function FormularioLogin() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, estadoInicial);
  const { errores } = estado;

  return (
    // noValidate: los errores los mostramos nosotros, en español y junto a cada campo.
    <form action={accion} noValidate className="flex w-full flex-col gap-4">
      <div className={GRUPO_CAMPO}>
        <label htmlFor="email" className={ETIQUETA}>
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={estado.email}
          aria-invalid={!!errores.email}
          aria-describedby={errores.email ? "email-error" : undefined}
          className={CAMPO}
        />
        {errores.email && <ErrorDeCampo id="email-error">{errores.email}</ErrorDeCampo>}
      </div>

      <div className={GRUPO_CAMPO}>
        <label htmlFor="password" className={ETIQUETA}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errores.password}
          aria-describedby={errores.password ? "password-error" : undefined}
          className={CAMPO}
        />
        {errores.password && <ErrorDeCampo id="password-error">{errores.password}</ErrorDeCampo>}
      </div>

      {estado.mensaje && (
        <Aviso tipo="error" role="alert">
          {estado.mensaje}
        </Aviso>
      )}

      <button type="submit" disabled={enviando} className={`${BOTON_PRINCIPAL} mt-2`}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
