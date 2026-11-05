"use client";

import { useActionState, useState, type FormEvent, type ReactNode } from "react";
import { guardarDatos } from "./actions";
import {
  DESCRIPCION_MAX,
  DISTRITOS_MADRID,
  NOMBRE_MAX,
  PRESUPUESTO_MAX,
  leerValoresDatos,
  validarDatosPerfil,
  type CampoDatos,
  type ErroresDatos,
  type ValoresDatos,
} from "./datos-perfil";

const ESTILO_CAMPO =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 aria-[invalid=true]:border-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

// PM-13 · Formulario «Tus datos». Mismo patrón que selector-rol.tsx, pero además
// comprueba los campos en el navegador antes de enviar y muestra cada aviso junto a su campo.
export function FormularioDatos({ valoresIniciales }: { valoresIniciales: ValoresDatos }) {
  const [estado, accion, guardando] = useActionState(guardarDatos, null);
  const [erroresNavegador, setErroresNavegador] = useState<ErroresDatos | null>(null);

  // Si el servidor devolvió errores, enseñamos lo que el usuario había escrito.
  const valores = estado?.valores ?? valoresIniciales;
  const errores = erroresNavegador ?? estado?.errores ?? {};

  const [largoDescripcion, setLargoDescripcion] = useState(valores.descripcion.length);

  // Antes de enviar: si falta algo, no se envía y se avisa junto a cada campo.
  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    const { errores } = validarDatosPerfil(leerValoresDatos(new FormData(evento.currentTarget)));
    if (errores) {
      evento.preventDefault();
      setErroresNavegador(errores);
      // Lleva al usuario al primer campo con error.
      const primero = Object.keys(errores)[0];
      evento.currentTarget.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
    } else {
      setErroresNavegador(null);
    }
  }

  // Props comunes para marcar un campo con error y enlazarlo con su aviso.
  const propsDeError = (campo: CampoDatos) => ({
    id: `campo-${campo}`,
    "aria-invalid": errores[campo] ? true : undefined,
    "aria-describedby": errores[campo] ? `error-${campo}` : undefined,
  });

  return (
    <form action={accion} onSubmit={alEnviar} noValidate className="flex flex-col gap-5">
      <Campo campo="nombre" etiqueta="Nombre" error={errores.nombre}>
        <input
          {...propsDeError("nombre")}
          type="text"
          name="nombre"
          required
          maxLength={NOMBRE_MAX}
          autoComplete="given-name"
          defaultValue={valores.nombre}
          className={ESTILO_CAMPO}
        />
      </Campo>

      <Campo
        campo="descripcion"
        etiqueta="Sobre ti"
        opcional
        ayuda={`${largoDescripcion}/${DESCRIPCION_MAX} caracteres`}
        error={errores.descripcion}
      >
        <textarea
          {...propsDeError("descripcion")}
          name="descripcion"
          rows={4}
          maxLength={DESCRIPCION_MAX}
          defaultValue={valores.descripcion}
          onChange={(e) => setLargoDescripcion(e.target.value.length)}
          placeholder="Qué estudias o a qué te dedicas, tus aficiones, cómo eres en casa…"
          className={ESTILO_CAMPO}
        />
      </Campo>

      <Campo campo="presupuesto" etiqueta="Presupuesto (€ al mes)" error={errores.presupuesto}>
        <input
          {...propsDeError("presupuesto")}
          type="number"
          name="presupuesto"
          required
          min={0}
          max={PRESUPUESTO_MAX}
          step={1}
          inputMode="numeric"
          defaultValue={valores.presupuesto}
          placeholder="Por ejemplo, 450"
          className={ESTILO_CAMPO}
        />
      </Campo>

      <Campo campo="zona" etiqueta="Zona (distrito de Madrid)" error={errores.zona}>
        {/* Después de guardar, React vacía el formulario y lo deja con los valores «por defecto».
            En los campos de texto React actualiza ese valor, pero en una lista desplegable no:
            volvería a «Elige un distrito…» aunque la zona se haya guardado. Con `key`, la lista
            se crea de nuevo cada vez que cambia la zona guardada y aparece la correcta. */}
        <select
          key={valores.zona}
          {...propsDeError("zona")}
          name="zona"
          required
          defaultValue={valores.zona}
          className={ESTILO_CAMPO}
        >
          <option value="">Elige un distrito…</option>
          {DISTRITOS_MADRID.map((distrito) => (
            <option key={distrito} value={distrito}>
              {distrito}
            </option>
          ))}
        </select>
      </Campo>

      <Campo
        campo="fecha_entrada"
        etiqueta="Fecha de entrada"
        opcional
        error={errores.fecha_entrada}
      >
        <input
          {...propsDeError("fecha_entrada")}
          type="date"
          name="fecha_entrada"
          defaultValue={valores.fecha_entrada}
          className={ESTILO_CAMPO}
        />
      </Campo>

      {estado?.error && (
        <p role="alert" className="text-sm text-red-600">
          {estado.error}
        </p>
      )}
      {/* No decir «guardados» si el navegador acaba de frenar un envío con errores. */}
      {estado?.guardado && !guardando && !erroresNavegador && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          Datos guardados.
        </p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {guardando ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

// Etiqueta + campo + aviso de error (o texto de ayuda) debajo.
function Campo({
  campo,
  etiqueta,
  opcional = false,
  ayuda,
  error,
  children,
}: {
  campo: CampoDatos;
  etiqueta: string;
  opcional?: boolean;
  ayuda?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={`campo-${campo}`}
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {etiqueta}
        {opcional && <span className="font-normal text-zinc-500"> (opcional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`error-${campo}`} className="text-sm text-red-600">
          {error}
        </p>
      ) : (
        ayuda && <p className="text-xs text-zinc-500">{ayuda}</p>
      )}
    </div>
  );
}
