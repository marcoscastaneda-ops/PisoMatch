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
import {
  Aviso,
  BOTON_PRINCIPAL,
  CAMPO,
  ETIQUETA,
  ETIQUETA_MAYUSCULAS,
  ETIQUETA_SUGERENCIA,
  GRUPO_CAMPO,
  TARJETA,
  TARJETA_OPCION,
} from "@/components/ui";

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
    <form onSubmit={enviar} className="flex flex-col gap-8 md:gap-12">
      <p aria-live="polite" className="text-sm font-semibold">
        Imprescindibles: {imprescindibles.length} de {MAX_IMPRESCINDIBLES}
      </p>

      {bloques.map((bloque) => (
        <section key={bloque.nombre} className="flex flex-col gap-4">
          <h2 className={ETIQUETA_MAYUSCULAS}>
            {bloque.nombre}
          </h2>

          {bloque.preguntas.map((pregunta) => {
            const esImprescindible = imprescindibles.includes(pregunta.id);
            // Con 3 ya marcadas, las demás casillas se bloquean; las marcadas siguen activas.
            const casillaBloqueada = !esImprescindible && alcanzadoLimite;
            return (
              <fieldset
                key={pregunta.id}
                className={`${TARJETA} flex flex-col gap-3`}
              >
                <legend className="sr-only">{pregunta.texto}</legend>
                <p aria-hidden className="mb-1 text-lg leading-[1.3] font-semibold">
                  {pregunta.texto}
                </p>

                {pregunta.opciones.map((opcion, posicion) => {
                  const valor = posicion + 1;
                  return (
                    <label
                      key={valor}
                      className={TARJETA_OPCION}
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
                        className="opcion"
                      />
                      <span>{opcion}</span>
                    </label>
                  );
                })}

                {/* PM-14: cuánto le importa esta pregunta. */}
                <div className={`${GRUPO_CAMPO} mt-2`}>
                  <label
                    htmlFor={`importancia-${pregunta.id}`}
                    className={ETIQUETA}
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
                    className={CAMPO}
                  >
                    {OPCIONES_IMPORTANCIA.map((opcion) => (
                      <option key={opcion.valor} value={opcion.valor}>
                        {opcion.texto}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PM-16: «Es imprescindible para mí». Nunca se marca sola. */}
                <div className={`${GRUPO_CAMPO} mt-2`}>
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
                      onChange={(e) => {
                        setImprescindibles(
                          e.target.checked
                            ? [...imprescindibles, pregunta.id]
                            : imprescindibles.filter((id) => id !== pregunta.id),
                        );
                        marcarCambio();
                      }}
                      className="casilla"
                    />
                    Es imprescindible para mí
                  </label>
                  {pregunta.imprescindibleSugerida && (
                    <p className={ETIQUETA_SUGERENCIA}>Suele ser imprescindible</p>
                  )}
                  {casillaBloqueada && (
                    <Aviso tipo="aviso">{AVISO_LIMITE_IMPRESCINDIBLES}</Aviso>
                  )}
                </div>
              </fieldset>
            );
          })}
        </section>
      ))}

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-borde bg-crema px-4 py-4 sm:-mx-6 sm:px-6">
        {estado && "error" in estado && (
          <Aviso tipo="error" role="alert">
            {estado.error}
          </Aviso>
        )}
        {estado && "guardado" in estado && !hayCambiosSinGuardar && !guardando && (
          <Aviso tipo="exito" role="status">
            Cambios guardados. Tu afinidad ya tiene en cuenta las nuevas respuestas.{" "}
            <Link href="/afinidad" className="font-semibold underline">
              Ver mi afinidad
            </Link>
          </Aviso>
        )}
        <button
          type="submit"
          disabled={guardando}
          className={BOTON_PRINCIPAL}
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
