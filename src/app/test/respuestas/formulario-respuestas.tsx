"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import type { Pregunta } from "../datos";
import { OPCIONES_IMPORTANCIA, normalizarImportancia, type Importancia } from "../importancia";
import {
  AVISO_LIMITE_IMPRESCINDIBLES,
  MAX_IMPRESCINDIBLES,
  VALOR_IMPRESCINDIBLE,
} from "../imprescindibles";
import { actualizarRespuestas } from "./actions";
import type { RespuestaGuardada } from "./datos";

// Una pregunta del test junto con lo que el usuario tiene guardado.
export type PreguntaConRespuesta = Pregunta & RespuestaGuardada;

// Todas las preguntas a la vista, agrupadas por bloque, con lo guardado ya marcado.
// Lo que el usuario cambia vive en el estado del navegador: si falla el guardado,
// no se pierde nada y puede volver a pulsar «Guardar cambios».
export function FormularioRespuestas({ preguntas }: { preguntas: PreguntaConRespuesta[] }) {
  const [estado, accion, guardando] = useActionState(actualizarRespuestas, null);
  // id de la pregunta → valor elegido (1, 2, 3…)
  const [respuestas, setRespuestas] = useState<Record<number, number>>(() =>
    Object.fromEntries(preguntas.map((p) => [p.id, p.valor])),
  );
  // id de la pregunta → importancia (PM-14)
  const [importancias, setImportancias] = useState<Record<number, Importancia>>(() =>
    Object.fromEntries(preguntas.map((p) => [p.id, p.importancia])),
  );
  // ids de las preguntas marcadas como imprescindibles (PM-16), como mucho 3.
  const [imprescindibles, setImprescindibles] = useState<number[]>(() =>
    preguntas.filter((p) => p.imprescindible).map((p) => p.id),
  );
  // Para no enseñar «Cambios guardados» si después se ha vuelto a tocar algo.
  const [hayCambiosSinGuardar, setHayCambiosSinGuardar] = useState(false);

  const alcanzadoLimite = imprescindibles.length >= MAX_IMPRESCINDIBLES;

  // Se envía a mano (y no con <form action>) para que React no vacíe el formulario
  // al terminar: así lo que se ve siempre coincide con el estado.
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setHayCambiosSinGuardar(false);
    startTransition(() => accion(datos));
  }

  function marcarCambio() {
    setHayCambiosSinGuardar(true);
  }

  // Agrupa las preguntas por bloque, manteniendo el orden del test.
  const bloques: { nombre: string; preguntas: PreguntaConRespuesta[] }[] = [];
  for (const pregunta of preguntas) {
    const ultimo = bloques.at(-1);
    if (ultimo && ultimo.nombre === pregunta.bloque) {
      ultimo.preguntas.push(pregunta);
    } else {
      bloques.push({ nombre: pregunta.bloque, preguntas: [pregunta] });
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-10">
      <p aria-live="polite" className="text-sm text-zinc-600 dark:text-zinc-400">
        Imprescindibles: {imprescindibles.length} de {MAX_IMPRESCINDIBLES}
      </p>

      {bloques.map((bloque) => (
        <section key={bloque.nombre} className="flex flex-col gap-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {bloque.nombre}
          </h2>

          {bloque.preguntas.map((pregunta) => {
            const esImprescindible = imprescindibles.includes(pregunta.id);
            // Con 3 ya marcadas, las demás casillas se bloquean; las marcadas siguen activas.
            const casillaBloqueada = !esImprescindible && alcanzadoLimite;
            return (
              <fieldset
                key={pregunta.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <legend className="sr-only">{pregunta.texto}</legend>
                <p aria-hidden className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {pregunta.texto}
                </p>

                {pregunta.opciones.map((opcion, posicion) => {
                  const valor = posicion + 1;
                  return (
                    <label
                      key={valor}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-3 has-[:checked]:border-zinc-900 has-[:checked]:ring-1 has-[:checked]:ring-zinc-900 dark:border-zinc-800 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:ring-zinc-100"
                    >
                      <input
                        type="radio"
                        name={`respuesta-${pregunta.id}`}
                        value={valor}
                        checked={respuestas[pregunta.id] === valor}
                        onChange={() => {
                          setRespuestas({ ...respuestas, [pregunta.id]: valor });
                          marcarCambio();
                        }}
                        className="mt-1"
                      />
                      <span className="text-zinc-900 dark:text-zinc-50">{opcion}</span>
                    </label>
                  );
                })}

                {/* PM-14: cuánto le importa esta pregunta. */}
                <div className="mt-1 flex flex-col gap-1">
                  <label
                    htmlFor={`importancia-${pregunta.id}`}
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    ¿Cuánto te importa?
                  </label>
                  <select
                    id={`importancia-${pregunta.id}`}
                    name={`importancia-${pregunta.id}`}
                    value={importancias[pregunta.id]}
                    onChange={(e) => {
                      setImportancias({
                        ...importancias,
                        [pregunta.id]: normalizarImportancia(e.target.value),
                      });
                      marcarCambio();
                    }}
                    className="self-start rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                  >
                    {OPCIONES_IMPORTANCIA.map((opcion) => (
                      <option key={opcion.valor} value={opcion.valor}>
                        {opcion.texto}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PM-16: «Es imprescindible para mí». Nunca se marca sola. */}
                <div className="mt-1 flex flex-col gap-1">
                  <label
                    className={`flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 ${
                      casillaBloqueada ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={`imprescindible-${pregunta.id}`}
                      value={VALOR_IMPRESCINDIBLE}
                      checked={esImprescindible}
                      disabled={casillaBloqueada}
                      onChange={(e) => {
                        setImprescindibles(
                          e.target.checked
                            ? [...imprescindibles, pregunta.id]
                            : imprescindibles.filter((id) => id !== pregunta.id),
                        );
                        marcarCambio();
                      }}
                    />
                    Es imprescindible para mí
                  </label>
                  {pregunta.imprescindibleSugerida && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Suele ser imprescindible</p>
                  )}
                  {casillaBloqueada && (
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {AVISO_LIMITE_IMPRESCINDIBLES}
                    </p>
                  )}
                </div>
              </fieldset>
            );
          })}
        </section>
      ))}

      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-zinc-200 bg-zinc-50 py-4 dark:border-zinc-800 dark:bg-black">
        {estado && "error" in estado && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            {estado.error}
          </p>
        )}
        {estado && "guardado" in estado && !hayCambiosSinGuardar && !guardando && (
          <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
            Cambios guardados. Tu afinidad ya tiene en cuenta las nuevas respuestas.{" "}
            <Link href="/afinidad" className="font-medium underline">
              Ver mi afinidad
            </Link>
          </p>
        )}
        <button
          type="submit"
          disabled={guardando}
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
