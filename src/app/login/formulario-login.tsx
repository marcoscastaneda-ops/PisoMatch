"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoLogin } from "./actions";

const estadoInicial: EstadoLogin = { errores: {}, email: "" };

const estiloCampo =
  "rounded-lg border px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-900 dark:text-zinc-50";
const bordeNormal = "border-zinc-300 dark:border-zinc-700";
const bordeError = "border-red-500";

export function FormularioLogin() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, estadoInicial);
  const { errores } = estado;

  return (
    // noValidate: los errores los mostramos nosotros, en español y junto a cada campo.
    <form action={accion} noValidate className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
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
          className={`${estiloCampo} ${errores.email ? bordeError : bordeNormal}`}
        />
        {errores.email && (
          <p id="email-error" className="text-sm text-red-600">
            {errores.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errores.password}
          aria-describedby={errores.password ? "password-error" : undefined}
          className={`${estiloCampo} ${errores.password ? bordeError : bordeNormal}`}
        />
        {errores.password && (
          <p id="password-error" className="text-sm text-red-600">
            {errores.password}
          </p>
        )}
      </div>

      {estado.mensaje && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {estado.mensaje}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
