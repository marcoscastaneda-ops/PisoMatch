import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { esRolValido, type Rol } from "@/app/perfil/roles";
import { cargarCandidatos } from "@/app/candidatos/datos";
import {
  FotoCandidato,
  etiquetaRolCandidato,
  type Candidato,
} from "@/app/candidatos/tarjeta-candidato";
import {
  Aviso,
  BOTON_PRINCIPAL,
  COLUMNA_ANCHA,
  ENLACE,
  ENLACE_EN_TEXTO,
  InsigniaAfinidad,
  NOMBRE_TARJETA,
  PAGINA,
  SEPARACION_SECCIONES,
  TARJETA,
  TEXTO_SUAVE,
  TITULO,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Mis matches · PisoMatch",
};

// «Mis matches» (PM-36): personas con las que el interés es mutuo.
export default function PaginaMatches() {
  return (
    <main className={PAGINA}>
      <div className={`${COLUMNA_ANCHA} ${SEPARACION_SECCIONES}`}>
        <section className="flex flex-col gap-2">
          <h1 className={TITULO}>Mis matches</h1>
          <p className="text-texto-suave">
            Personas a las que les interesas tanto como te interesan a ti.
          </p>
        </section>
        <Suspense fallback={<p className={TEXTO_SUAVE}>Buscando tus matches…</p>}>
          <ContenidoMatches />
        </Suspense>
      </div>
    </main>
  );
}

async function ContenidoMatches() {
  // Depende de la sesión del usuario: generar en cada visita, nunca por adelantado.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  // 1. Sin sesión → a iniciar sesión.
  if (!userId) {
    redirect("/login");
  }

  // 2. Perfil completo (su rol decide cómo se describe a cada persona). Si no → a /perfil.
  const { data: miPerfil, error: errorPerfil } = await supabase
    .from("profiles")
    .select("rol, acepta_privacidad")
    .eq("id", userId)
    .maybeSingle();

  if (errorPerfil) {
    return <MensajeError />;
  }
  if (!miPerfil || !esRolValido(miPerfil.rol) || miPerfil.acepta_privacidad !== true) {
    redirect("/perfil");
  }
  const miRol: Rol = miPerfil.rol;

  // 3. La base de datos dice con quién hay match (migración 0006): solo ids y porcentajes.
  const { data: filas, error } = await supabase.rpc("mis_matches");
  if (error || !Array.isArray(filas)) {
    return <MensajeError />;
  }

  const matches = await cargarCandidatos(
    supabase,
    filas as { usuario_id: string; afinidad: number | null }[],
  );
  if (matches === null) {
    return <MensajeError />;
  }

  // 4. Correo de contacto de cada match (PM-39, migración 0009). La base de datos solo
  //    lo da si el match es mutuo. Si falla, las tarjetas se ven igual, con un aviso.
  const correos = await cargarCorreos(supabase, matches.length);

  return (
    <>
      {matches.length === 0 ? (
        <section className="flex flex-col gap-4">
          <p className="text-texto-suave">
            Aún no tienes matches. Cuando alguien que te interesa también se interese por ti,
            aparecerá aquí.
          </p>
          <Link href="/candidatos" className={`${BOTON_PRINCIPAL} sm:w-auto sm:self-start`}>
            Ver candidatos
          </Link>
        </section>
      ) : (
        <section className="flex flex-col gap-4" aria-label="Lista de matches">
          <p className={TEXTO_SUAVE}>
            {matches.length === 1 ? "1 match" : `${matches.length} matches`}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <li key={match.id}>
                <TarjetaMatch
                  match={match}
                  miRol={miRol}
                  correo={correos === null ? null : (correos.get(match.id) ?? null)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {matches.length > 0 ? (
          <Link href="/candidatos" className={ENLACE}>
            Ver más candidatos
          </Link>
        ) : null}
        <Link href="/perfil" className={ENLACE}>
          Volver a mi perfil
        </Link>
      </div>
    </>
  );
}

// Correos de mis matches (función correos_de_mis_matches, migración 0009), por id.
// Devuelve null si no se pudieron cargar.
async function cargarCorreos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cuantosMatches: number,
): Promise<Map<string, string> | null> {
  if (cuantosMatches === 0) return new Map();
  const { data, error } = await supabase.rpc("correos_de_mis_matches");
  if (error || !Array.isArray(data)) return null;
  return new Map(
    (data as { usuario_id: string; correo: string | null }[])
      .filter((fila) => !!fila.correo)
      .map((fila) => [fila.usuario_id, fila.correo as string]),
  );
}

// Tarjeta de un match: foto, nombre, rol, afinidad y correo (PM-39). Nada más de su perfil.
function TarjetaMatch({
  match,
  miRol,
  correo,
}: {
  match: Candidato;
  miRol: Rol;
  correo: string | null;
}) {
  return (
    <article className={`${TARJETA} flex h-full flex-col gap-4`}>
      <FotoCandidato nombre={match.nombre} fotoUrl={match.fotoUrl} />
      <div className="flex items-start justify-between gap-3">
        <h2 className={`${NOMBRE_TARJETA} min-w-0 break-words`}>{match.nombre}</h2>
        <InsigniaAfinidad>
          {match.afinidad} %<span className="sr-only"> de afinidad</span>
        </InsigniaAfinidad>
      </div>
      <p className={TEXTO_SUAVE}>
        <span className="font-semibold">Rol: </span>
        {etiquetaRolCandidato(match.rol, miRol)}
      </p>
      {correo ? (
        <p className={TEXTO_SUAVE}>
          <span className="font-semibold">Correo: </span>
          <a href={`mailto:${correo}`} className={`${ENLACE_EN_TEXTO} break-all`}>
            {correo}
          </a>
          <br />
          Escríbele para conoceros y organizar una visita al piso.
        </p>
      ) : (
        <p className={TEXTO_SUAVE}>
          No hemos podido cargar su correo. Recarga la página para intentarlo de nuevo.
        </p>
      )}
    </article>
  );
}

function MensajeError() {
  return (
    <Aviso tipo="error">
      No se pudieron cargar tus matches. Recarga la página para intentarlo de nuevo.
    </Aviso>
  );
}
