"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarse, type EstadoRegistro } from "./actions";
import {
  Aviso,
  BOTON_PRINCIPAL,
  CAMPO,
  ErrorDeCampo,
  ETIQUETA,
  GRUPO_CAMPO,
  TEXTO_SUAVE,
} from "@/components/ui";

const estadoInicial: EstadoRegistro = { errores: {}, email: "" };

export function FormularioRegistro() {
  const [estado, accion, enviando] = useActionState(registrarse, estadoInicial);
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
          autoComplete="new-password"
          aria-invalid={!!errores.password}
          aria-describedby={errores.password ? "password-error" : "password-ayuda"}
          className={CAMPO}
        />
        {errores.password ? (
          <ErrorDeCampo id="password-error">{errores.password}</ErrorDeCampo>
        ) : (
          <p id="password-ayuda" className={TEXTO_SUAVE}>
            Mínimo 8 caracteres.
          </p>
        )}
      </div>

      {estado.yaRegistrado && (
        <Aviso tipo="aviso" role="alert">
          Ya existe una cuenta con este correo.{" "}
          <Link href="/login" className="font-semibold underline">
            Inicia sesión
          </Link>{" "}
          para entrar.
        </Aviso>
      )}

      {estado.mensaje && (
        <Aviso tipo="error" role="alert">
          {estado.mensaje}
        </Aviso>
      )}

      <button type="submit" disabled={enviando} className={`${BOTON_PRINCIPAL} mt-2`}>
        {enviando ? "Creando tu cuenta…" : "Registrarme"}
      </button>
    </form>
  );
}
