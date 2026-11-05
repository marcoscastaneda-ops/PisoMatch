"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { guardarRespuestas } from "./actions";
import type { Pregunta } from "./datos";
import {
  IMPORTANCIA_POR_DEFECTO,
  OPCIONES_IMPORTANCIA,
  normalizarImportancia,
  type Importancia,
} from "./importancia";

// El test, una pregunta cada vez. Las respuestas se guardan en el navegador
// (estado `respuestas`) hasta pulsar «Finalizar»; así no se pierden al ir atrás
// ni si falla el guardado.
export function CuestionarioTest({ preguntas }: { preguntas: Pregunta[] }) {
  const [estado, accion, guardando] = useActionState(guardarRespuestas, null);
  const [indice, setIndice] = useState(0);
  // id de la pregunta → valor elegido (1, 2, 3…)
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  // id de la pregunta → importancia elegida. Si no está, vale «algo» (PM-14).
  const [importancias, setImportancias] = useState<Record<number, Importancia>>({});
  const importanciaDe = (id: number) => importancias[id] ?? IMPORTANCIA_POR_DEFECTO;

  if (estado && "guardado" in estado) {
    return <ConfirmacionTest />;
  }

  const total = preguntas.length;
  const pregunta = preguntas[indice];
  const esLaUltima = indice === total - 1;
  const respondida = respuestas[pregunta.id] !== undefined;

  return (
    <form action={accion} className="flex flex-col gap-6">
      {/* Las respuestas de las otras preguntas viajan ocultas para enviarlas todas juntas. */}
      {preguntas.map((p) =>
        p.id !== pregunta.id && respuestas[p.id] !== undefined ? (
          <input key={p.id} type="hidden" name={`respuesta-${p.id}`} value={respuestas[p.id]} />
        ) : null,
      )}
      {/* Igual con la importancia de las otras preguntas («algo» si no se cambió). */}
      {preguntas.map((p) =>
        p.id !== pregunta.id ? (
          <input key={p.id} type="hidden" name={`importancia-${p.id}`} value={importanciaDe(p.id)} />
        ) : null,
      )}

      <BarraProgreso actual={indice + 1} total={total} />

      {/* key: al cambiar de pregunta, React crea las opciones de cero. */}
      <fieldset key={pregunta.id} className="flex flex-col gap-3">
        <legend className="mb-2 flex flex-col gap-1">
          <span className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {pregunta.bloque}
          </span>
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {pregunta.texto}
          </span>
        </legend>

        {pregunta.opciones.map((opcion, posicion) => {
          const valor = posicion + 1;
          return (
            <label
              key={valor}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 has-[:checked]:border-zinc-900 has-[:checked]:ring-1 has-[:checked]:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:ring-zinc-100"
            >
              <input
                type="radio"
                name={`respuesta-${pregunta.id}`}
                value={valor}
                checked={respuestas[pregunta.id] === valor}
                onChange={() => setRespuestas({ ...respuestas, [pregunta.id]: valor })}
                className="mt-1"
              />
              <span className="text-zinc-900 dark:text-zinc-50">{opcion}</span>
            </label>
          );
        })}

        {/* PM-14: cuánto le importa esta pregunta. «Algo» viene elegido por defecto. */}
        <div className="mt-2 flex flex-col gap-1">
          <label
            htmlFor={`importancia-${pregunta.id}`}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            ¿Cuánto te importa?
          </label>
          <select
            id={`importancia-${pregunta.id}`}
            name={`importancia-${pregunta.id}`}
            value={importanciaDe(pregunta.id)}
            onChange={(e) =>
              setImportancias({ ...importancias, [pregunta.id]: normalizarImportancia(e.target.value) })
            }
            className="self-start rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          >
            {OPCIONES_IMPORTANCIA.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.texto}
              </option>
            ))}
          </select>
        </div>

        {/* PM-16: aquí irá «Es imprescindible» (usar pregunta.imprescindibleSugerida). */}
      </fieldset>

      {estado && "error" in estado && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {estado.error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndice(indice - 1)}
          disabled={indice === 0 || guardando}
          className="rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Anterior
        </button>

        {esLaUltima ? (
          <button
            type="submit"
            disabled={!respondida || guardando}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {guardando ? "Guardando…" : "Finalizar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndice(indice + 1)}
            disabled={!respondida}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Siguiente
          </button>
        )}
      </div>

      {!respondida && (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Elige una respuesta para continuar.
        </p>
      )}
    </form>
  );
}

// «Pregunta 3 de 15» y la barra que se va llenando.
function BarraProgreso({ actual, total }: { actual: number; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p aria-live="polite" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Pregunta {actual} de {total}
      </p>
      <div
        role="progressbar"
        aria-label="Progreso del test"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={actual}
        className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div
          className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-50"
          style={{ width: `${(actual / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function ConfirmacionTest() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        ¡Test completado!
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400">
        Hemos guardado tus respuestas. Con ellas buscaremos compañeros de piso que encajen contigo.
      </p>
      <Link
        href="/perfil"
        className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Volver a mi perfil
      </Link>
    </div>
  );
}
