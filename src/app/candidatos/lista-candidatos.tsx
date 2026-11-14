"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Rol } from "@/app/perfil/roles";
import {
  Aviso,
  BOTON_PRINCIPAL,
  BOTON_SECUNDARIO,
  ENLACE_EN_TEXTO,
  TEXTO_SUAVE,
} from "@/components/ui";
import { valorarCandidato, type Decision } from "./actions";
import { TarjetaCandidato, type Candidato } from "./tarjeta-candidato";

// Lista de /candidatos con los botones «Me interesa» y «Descartar» (PM-36).
// Al pulsar, se guarda la decisión y la tarjeta desaparece. Si hay match, aviso arriba.
export function ListaCandidatos({
  candidatos,
  miRol,
  conFiltros,
}: {
  candidatos: Candidato[];
  miRol: Rol;
  conFiltros: boolean;
}) {
  // Ids ya valorados en esta visita (la próxima vez ya no los manda la base de datos).
  const [valorados, setValorados] = useState<Set<string>>(() => new Set());
  const [matchCon, setMatchCon] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState<{ id: string; decision: Decision } | null>(null);
  const [, startTransition] = useTransition();

  const guardando = (candidato: Candidato, decision: Decision) =>
    enCurso?.id === candidato.id && enCurso.decision === decision;

  const pendientes = candidatos.filter((candidato) => !valorados.has(candidato.id));

  function valorar(candidato: Candidato, decision: Decision) {
    setEnCurso({ id: candidato.id, decision });
    setError(null);
    startTransition(async () => {
      const resultado = await valorarCandidato(candidato.id, decision);
      setEnCurso(null);
      if ("error" in resultado) {
        // La tarjeta se queda para poder intentarlo otra vez.
        setError(resultado.error);
        return;
      }
      setValorados((anteriores) => new Set(anteriores).add(candidato.id));
      if (resultado.match) setMatchCon(candidato.nombre);
    });
  }

  return (
    <section className="flex flex-col gap-4" aria-label="Lista de candidatos">
      {matchCon ? (
        <Aviso tipo="exito" role="status">
          <span className="font-semibold">¡Es un match con {matchCon}! 🎉</span> A los dos os
          interesa convivir.{" "}
          <Link href="/matches" className={ENLACE_EN_TEXTO}>
            Ver mis matches
          </Link>
        </Aviso>
      ) : null}
      {error ? (
        <Aviso tipo="error" role="alert">
          {error}
        </Aviso>
      ) : null}

      {pendientes.length === 0 ? (
        <MensajeVacio conFiltros={conFiltros} todosValorados={valorados.size > 0} />
      ) : (
        <>
          <p className={TEXTO_SUAVE} role="status">
            {pendientes.length === 1 ? "1 candidato" : `${pendientes.length} candidatos`}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendientes.map((candidato) => {
              const ocupado = enCurso !== null;
              return (
                <li key={candidato.id}>
                  <TarjetaCandidato
                    candidato={candidato}
                    miRol={miRol}
                    acciones={
                      <>
                        <button
                          type="button"
                          className={BOTON_PRINCIPAL}
                          disabled={ocupado}
                          onClick={() => valorar(candidato, "interesa")}
                        >
                          {guardando(candidato, "interesa") ? "Guardando…" : "Me interesa"}
                          <span className="sr-only"> ({candidato.nombre})</span>
                        </button>
                        <button
                          type="button"
                          className={`${BOTON_SECUNDARIO} w-full`}
                          disabled={ocupado}
                          onClick={() => valorar(candidato, "descarta")}
                        >
                          {guardando(candidato, "descarta") ? "Guardando…" : "Descartar"}
                          <span className="sr-only"> ({candidato.nombre})</span>
                        </button>
                      </>
                    }
                  />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

function MensajeVacio({
  conFiltros,
  todosValorados,
}: {
  conFiltros: boolean;
  todosValorados: boolean;
}) {
  if (todosValorados) {
    return (
      <p className="text-texto-suave">
        Ya has valorado a todos tus candidatos. Vuelve en unos días para ver gente nueva.
      </p>
    );
  }
  return conFiltros ? (
    <p className="text-texto-suave">
      Nadie cumple estos filtros. Prueba con otros o pulsa «Quitar filtros».
    </p>
  ) : (
    <p className="text-texto-suave">
      Todavía no hay candidatos compatibles. Vuelve en unos días.
    </p>
  );
}
