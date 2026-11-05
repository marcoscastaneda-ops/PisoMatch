import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { yaHizoElTest } from "@/app/test/datos";
import {
  Aviso,
  COLUMNA_ESTRECHA,
  ENLACE,
  InsigniaAfinidad,
  PAGINA,
  SEPARACION_SECCIONES,
  TARJETA,
  TEXTO_SUAVE,
  TITULO,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Afinidad · PisoMatch",
};

// Una persona de la lista: solo su nombre y el porcentaje. Nada más de su perfil.
type Candidato = {
  id: string;
  nombre: string;
  afinidad: number;
};

export default function PaginaAfinidad() {
  return (
    <main className={PAGINA}>
      <div className={`${COLUMNA_ESTRECHA} ${SEPARACION_SECCIONES}`}>
        <section className="flex flex-col gap-2">
          <h1 className={TITULO}>Tu afinidad</h1>
          <p className="text-texto-suave">
            Cuánto encajas con cada persona que ha hecho el test de convivencia.
          </p>
        </section>
        <Suspense fallback={<p className={TEXTO_SUAVE}>Calculando afinidades…</p>}>
          <ListaAfinidad />
        </Suspense>
      </div>
    </main>
  );
}

async function ListaAfinidad() {
  // Depende de la sesión del usuario: generar en cada visita, nunca por adelantado.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  // 1. Sin sesión → a iniciar sesión.
  if (!userId) {
    redirect("/login");
  }

  // 2. Sin test hecho → al test (que, si falta el perfil, lleva a /perfil).
  //    Las 15 respuestas se guardan de una vez, así que tener alguna = test completo.
  const hecho = await yaHizoElTest(supabase, userId);
  if (hecho === false) {
    redirect("/test");
  }

  // 3. El cálculo lo hace la base de datos (migración 0005): solo devuelve ids y porcentajes.
  const { data: afinidades, error } = await supabase.rpc("mis_afinidades");

  if (hecho === null || error || !Array.isArray(afinidades)) {
    return <MensajeError />;
  }

  // 4. Nombres de esas personas (profiles es visible para usuarios con sesión).
  const filas = afinidades as { usuario_id: string; afinidad: number | null }[];
  const ids = filas.map((fila) => fila.usuario_id);
  const nombres = new Map<string, string>();
  if (ids.length > 0) {
    const { data: perfiles, error: errorPerfiles } = await supabase
      .from("profiles")
      .select("id, nombre")
      .in("id", ids);
    if (errorPerfiles || !perfiles) {
      return <MensajeError />;
    }
    perfiles.forEach((perfil) => nombres.set(perfil.id, perfil.nombre));
  }

  const candidatos: Candidato[] = filas
    .filter((fila) => fila.afinidad !== null && nombres.has(fila.usuario_id))
    .map((fila) => ({
      id: fila.usuario_id,
      nombre: nombres.get(fila.usuario_id)!,
      afinidad: fila.afinidad!,
    }))
    .sort((a, b) => b.afinidad - a.afinidad);

  if (candidatos.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-texto-suave">
          Todavía nadie más ha completado el test. Vuelve en unos días.
        </p>
        <VolverAlPerfil />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {candidatos.map((candidato) => (
          <li
            key={candidato.id}
            className={`${TARJETA} flex items-center justify-between gap-4`}
          >
            <span className="min-w-0 text-lg font-semibold break-words">{candidato.nombre}</span>
            <InsigniaAfinidad>{candidato.afinidad} %</InsigniaAfinidad>
          </li>
        ))}
      </ul>
      <VolverAlPerfil />
    </div>
  );
}

function MensajeError() {
  return (
    <Aviso tipo="error">
      No se pudo calcular la afinidad. Recarga la página para intentarlo de nuevo.
    </Aviso>
  );
}

function VolverAlPerfil() {
  return (
    <Link href="/perfil" className={`${ENLACE} self-start`}>
      Volver a mi perfil
    </Link>
  );
}
