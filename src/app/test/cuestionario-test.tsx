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
import {
  AVISO_LIMITE_IMPRESCINDIBLES,
  MAX_IMPRESCINDIBLES,
  VALOR_IMPRESCINDIBLE,
} from "./imprescindibles";
import {
  Aviso,
  BOTON_PRINCIPAL,
  BOTON_SECUNDARIO,
  CAMPO,
  ETIQUETA,
  ETIQUETA_MAYUSCULAS,
  ETIQUETA_SUGERENCIA,
  GRUPO_CAMPO,
  SUBTITULO,
  TARJETA_OPCION,
  TEXTO_SUAVE,
} from "@/components/ui";

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
  // ids de las preguntas marcadas como imprescindibles (PM-16), como mucho 3.
  const [imprescindibles, setImprescindibles] = useState<number[]>([]);

  if (estado && "guardado" in estado) {
    return <ConfirmacionTest />;
  }

  const total = preguntas.length;
  const pregunta = preguntas[indice];
  const esLaUltima = indice === total - 1;
  const respondida = respuestas[pregunta.id] !== undefined;
  const esImprescindible = imprescindibles.includes(pregunta.id);
  // Con 3 ya marcadas, las demás casillas se bloquean; las marcadas siguen activas para desmarcarlas.
  const casillaBloqueada = !esImprescindible && imprescindibles.length >= MAX_IMPRESCINDIBLES;

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
      {/* Y las otras preguntas marcadas como imprescindibles (las no marcadas no se envían). */}
      {imprescindibles.map((id) =>
        id !== pregunta.id ? (
          <input key={id} type="hidden" name={`imprescindible-${id}`} value={VALOR_IMPRESCINDIBLE} />
        ) : null,
      )}

      <BarraProgreso actual={indice + 1} total={total} />

      {/* key: al cambiar de pregunta, React crea las opciones de cero. */}
      <fieldset key={pregunta.id} className="flex flex-col gap-3">
        <legend className="mb-3 flex flex-col gap-2">
          <span className={ETIQUETA_MAYUSCULAS}>{pregunta.bloque}</span>
          <span className={SUBTITULO}>{pregunta.texto}</span>
        </legend>

        {pregunta.opciones.map((opcion, posicion) => {
          const valor = posicion + 1;
          return (
            <label key={valor} className={TARJETA_OPCION}>
              <input
                type="radio"
                name={`respuesta-${pregunta.id}`}
                value={valor}
                checked={respuestas[pregunta.id] === valor}
                onChange={() => setRespuestas({ ...respuestas, [pregunta.id]: valor })}
                className="opcion"
              />
              <span>{opcion}</span>
            </label>
          );
        })}

        {/* PM-14: cuánto le importa esta pregunta. «Algo» viene elegido por defecto. */}
        <div className={`${GRUPO_CAMPO} mt-3`}>
          <label htmlFor={`importancia-${pregunta.id}`} className={ETIQUETA}>
            ¿Cuánto te importa?
          </label>
          <select
            id={`importancia-${pregunta.id}`}
            name={`importancia-${pregunta.id}`}
            value={importanciaDe(pregunta.id)}
            onChange={(e) =>
              setImportancias({ ...importancias, [pregunta.id]: normalizarImportancia(e.target.value) })
            }
            className={CAMPO}
          >
            {OPCIONES_IMPORTANCIA.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.texto}
              </option>
            ))}
          </select>
        </div>

        {/* PM-16: «Es imprescindible para mí». Nunca se marca sola, ni en las sugeridas. */}
        <div className="mt-3 flex flex-col gap-2">
          <label
            className={`flex min-h-12 items-center gap-3 font-semibold ${
              casillaBloqueada ? "cursor-not-allowed text-desactivado-texto" : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              name={`imprescindible-${pregunta.id}`}
              value={VALOR_IMPRESCINDIBLE}
              checked={esImprescindible}
              disabled={casillaBloqueada}
              aria-describedby={`aviso-imprescindibles-${pregunta.id}`}
              onChange={(e) =>
                setImprescindibles(
                  e.target.checked
                    ? [...imprescindibles, pregunta.id]
                    : imprescindibles.filter((id) => id !== pregunta.id),
                )
              }
              className="casilla"
            />
            Es imprescindible para mí
          </label>
          {pregunta.imprescindibleSugerida && (
            <p className={ETIQUETA_SUGERENCIA}>Suele ser imprescindible</p>
          )}
          <div id={`aviso-imprescindibles-${pregunta.id}`} aria-live="polite" className="flex flex-col gap-2">
            <p className={TEXTO_SUAVE}>
              Imprescindibles: {imprescindibles.length} de {MAX_IMPRESCINDIBLES}
            </p>
            {casillaBloqueada && <Aviso tipo="aviso">{AVISO_LIMITE_IMPRESCINDIBLES}</Aviso>}
          </div>
        </div>
      </fieldset>

      {estado && "error" in estado && (
        <Aviso tipo="error" role="alert">
          {estado.error}
        </Aviso>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIndice(indice - 1)}
          disabled={indice === 0 || guardando}
          className={`${BOTON_SECUNDARIO} flex-1 sm:flex-none`}
        >
          Anterior
        </button>

        {esLaUltima ? (
          <button
            type="submit"
            disabled={!respondida || guardando}
            className={`${BOTON_PRINCIPAL} flex-1 sm:ml-auto sm:w-auto sm:flex-none`}
          >
            {guardando ? "Guardando…" : "Finalizar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndice(indice + 1)}
            disabled={!respondida}
            className={`${BOTON_PRINCIPAL} flex-1 sm:ml-auto sm:w-auto sm:flex-none`}
          >
            Siguiente
          </button>
        )}
      </div>

      {!respondida && (
        <p className={`text-center ${TEXTO_SUAVE}`}>Elige una respuesta para continuar.</p>
      )}
    </form>
  );
}

// «Pregunta 3 de 15» y la barra que se va llenando (menta, como pide la guía).
function BarraProgreso({ actual, total }: { actual: number; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p aria-live="polite" className="text-sm font-semibold">
        Pregunta {actual} de {total}
      </p>
      <div
        role="progressbar"
        aria-label="Progreso del test"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={actual}
        className="h-2 w-full overflow-hidden rounded-full bg-borde"
      >
        <div
          className="h-full rounded-full bg-menta transition-all"
          style={{ width: `${(actual / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function ConfirmacionTest() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <h2 className={SUBTITULO}>¡Test completado!</h2>
      <p className="text-texto-suave">
        Hemos guardado tus respuestas. Con ellas buscaremos compañeros de piso que encajen contigo.
      </p>
      <Link href="/perfil" className={`${BOTON_PRINCIPAL} mt-2`}>
        Volver a mi perfil
      </Link>
    </div>
  );
}
