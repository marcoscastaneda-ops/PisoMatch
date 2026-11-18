"use client";

import { useEffect, useId, useRef, useState, useTransition, type Ref } from "react";
import Link from "next/link";
import type { Rol } from "@/app/perfil/roles";
import {
  AVATAR_GRANDE,
  Aviso,
  BOTON_PRINCIPAL,
  BOTON_PRINCIPAL_PAREJA,
  BOTON_SECUNDARIO,
  BOTON_SECUNDARIO_PAREJA,
  IconoCheck,
  SUBTITULO,
  TEXTO_SUAVE,
  VENTANA_MODAL,
} from "@/components/ui";
import { valorarCandidato, type Decision } from "./actions";
import { FotoCandidato, TarjetaCandidato, type Candidato } from "./tarjeta-candidato";

// Tiempo que se ve «Le has dicho que te interesa» antes de que la tarjeta desaparezca (PM-56).
const MS_CONFIRMACION = 2000;

// Lista de /candidatos con los botones «Descartar» y «Me interesa» (PM-36, diseño PM-56).
// - «Descartar»: la tarjeta desaparece.
// - «Me interesa» sin match: la tarjeta muestra una confirmación 2 s y luego desaparece.
// - «Me interesa» con match: la tarjeta desaparece y se abre la ventana de match.
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
  // Ids que están enseñando la confirmación de «Me interesa» antes de desaparecer.
  const [confirmados, setConfirmados] = useState<Set<string>>(() => new Set());
  const [matchCon, setMatchCon] = useState<Candidato | null>(null);
  const [anuncio, setAnuncio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState<{ id: string; decision: Decision } | null>(null);
  const [, startTransition] = useTransition();

  // Adónde va el foco cuando desaparece la tarjeta que lo tenía (el contador o el mensaje).
  const destinoFoco = useRef<HTMLParagraphElement>(null);
  const temporizadores = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Al salir de la página, cancelar las tarjetas que estaban esperando para desaparecer.
  useEffect(() => {
    const pendientesDeQuitar = temporizadores.current;
    return () => pendientesDeQuitar.forEach(clearTimeout);
  }, []);

  // Si al quitar una tarjeta el foco se ha perdido, llevarlo al contador.
  useEffect(() => {
    if (valorados.size > 0 && (!document.activeElement || document.activeElement === document.body)) {
      destinoFoco.current?.focus();
    }
  }, [valorados]);

  const guardando = (candidato: Candidato, decision: Decision) =>
    enCurso?.id === candidato.id && enCurso.decision === decision;

  const pendientes = candidatos.filter((candidato) => !valorados.has(candidato.id));

  function quitar(id: string) {
    setValorados((anteriores) => new Set(anteriores).add(id));
  }

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
      if (resultado.match) {
        quitar(candidato.id);
        setMatchCon(candidato);
        return;
      }
      if (decision === "descarta") {
        quitar(candidato.id);
        return;
      }
      // «Me interesa» sin match: confirmación en la tarjeta y, a los 2 s, fuera.
      setConfirmados((anteriores) => new Set(anteriores).add(candidato.id));
      setAnuncio(
        `Le has dicho a ${candidato.nombre} que te interesa. Si también le interesas, tendréis un match.`,
      );
      const temporizador = setTimeout(() => {
        temporizadores.current.delete(temporizador);
        quitar(candidato.id);
      }, MS_CONFIRMACION);
      temporizadores.current.add(temporizador);
    });
  }

  return (
    <section className="flex flex-col gap-4" aria-label="Lista de candidatos">
      {/* Para lectores de pantalla: la confirmación de «Me interesa». */}
      <p className="sr-only" role="status">
        {anuncio}
      </p>
      {error ? (
        <Aviso tipo="error" role="alert">
          {error}
        </Aviso>
      ) : null}

      {pendientes.length === 0 ? (
        <MensajeVacio
          ref={destinoFoco}
          conFiltros={conFiltros}
          todosValorados={valorados.size > 0}
        />
      ) : (
        <>
          <p ref={destinoFoco} tabIndex={-1} className={`${TEXTO_SUAVE} outline-none`} role="status">
            {pendientes.length === 1 ? "1 candidato" : `${pendientes.length} candidatos`}
          </p>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendientes.map((candidato) => {
              const ocupado = enCurso !== null;
              return (
                <li key={candidato.id}>
                  <TarjetaCandidato
                    candidato={candidato}
                    miRol={miRol}
                    acciones={
                      confirmados.has(candidato.id) ? (
                        <ConfirmacionInteres />
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            className={BOTON_SECUNDARIO_PAREJA}
                            disabled={ocupado}
                            onClick={() => valorar(candidato, "descarta")}
                          >
                            {guardando(candidato, "descarta") ? "Guardando…" : "Descartar"}
                            <span className="sr-only"> ({candidato.nombre})</span>
                          </button>
                          <button
                            type="button"
                            className={BOTON_PRINCIPAL_PAREJA}
                            disabled={ocupado}
                            onClick={() => valorar(candidato, "interesa")}
                          >
                            {guardando(candidato, "interesa") ? "Guardando…" : "Me interesa"}
                            <span className="sr-only"> ({candidato.nombre})</span>
                          </button>
                        </div>
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        </>
      )}

      {matchCon ? (
        <VentanaMatch
          key={matchCon.id}
          persona={matchCon}
          onCerrar={() => {
            setMatchCon(null);
            destinoFoco.current?.focus();
          }}
        />
      ) : null}
    </section>
  );
}

// Lo que sale en la tarjeta justo después de «Me interesa» (boceto 1, B).
function ConfirmacionInteres() {
  return (
    <Aviso tipo="exito">
      <span className="flex items-start gap-2">
        <IconoCheck />
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold">Le has dicho que te interesa</span>
          <span>Si también le interesas, tendréis un match</span>
        </span>
      </span>
    </Aviso>
  );
}

// Ventana de match (boceto 2). <dialog> con showModal(): Escape la cierra, el foco se queda
// dentro mientras está abierta y los lectores de pantalla la anuncian como ventana.
function VentanaMatch({ persona, onCerrar }: { persona: Candidato; onCerrar: () => void }) {
  const ventana = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const idTexto = useId();

  useEffect(() => {
    const dialogo = ventana.current;
    if (dialogo && !dialogo.open) dialogo.showModal();
  }, []);

  return (
    <dialog
      ref={ventana}
      className={VENTANA_MODAL}
      aria-labelledby={idTitulo}
      aria-describedby={idTexto}
      onClose={onCerrar}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex" aria-hidden>
          <div className={AVATAR_GRANDE}>Tú</div>
          <div className="-ml-3">
            <FotoCandidato nombre={persona.nombre} fotoUrl={persona.fotoUrl} grande />
          </div>
        </div>
        <h2 id={idTitulo} className={SUBTITULO}>
          ¡Tenéis un match con {persona.nombre}!
        </h2>
        <p id={idTexto} className="text-texto-suave">
          Os interesáis el uno al otro. Ya puedes ver su correo de contacto en Mis matches.
        </p>
        <div className="flex w-full flex-col gap-3">
          <Link href="/matches" className={BOTON_PRINCIPAL}>
            Ver mis matches
          </Link>
          <button
            type="button"
            className={`${BOTON_SECUNDARIO} w-full`}
            onClick={() => ventana.current?.close()}
          >
            Seguir viendo candidatos
          </button>
        </div>
      </div>
    </dialog>
  );
}

function MensajeVacio({
  ref,
  conFiltros,
  todosValorados,
}: {
  ref: Ref<HTMLParagraphElement>;
  conFiltros: boolean;
  todosValorados: boolean;
}) {
  const texto = todosValorados
    ? "Ya has valorado a todos tus candidatos. Vuelve en unos días para ver gente nueva."
    : conFiltros
      ? "Nadie cumple estos filtros. Prueba con otros o pulsa «Quitar filtros»."
      : "Todavía no hay candidatos compatibles. Vuelve en unos días.";
  return (
    <p ref={ref} tabIndex={-1} className="text-texto-suave outline-none">
      {texto}
    </p>
  );
}
