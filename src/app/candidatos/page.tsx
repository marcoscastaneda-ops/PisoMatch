import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { yaHizoElTest } from "@/app/test/datos";
import { esRolValido, type Rol } from "@/app/perfil/roles";
import { FiltrosCandidatos } from "./filtros-candidatos";
import { ListaCandidatos } from "./lista-candidatos";
import { cargarCandidatos } from "./datos";
import { hayFiltros, leerFiltros } from "./filtros";
import {
  Aviso,
  COLUMNA_ANCHA,
  ENLACE,
  PAGINA,
  SEPARACION_SECCIONES,
  TEXTO_SUAVE,
  TITULO,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Candidatos · PisoMatch",
};

type ParametrosUrl = { [clave: string]: string | string[] | undefined };

export default function PaginaCandidatos({
  searchParams,
}: {
  searchParams: Promise<ParametrosUrl>;
}) {
  return (
    <main className={PAGINA}>
      <div className={`${COLUMNA_ANCHA} ${SEPARACION_SECCIONES}`}>
        <section className="flex flex-col gap-2">
          <h1 className={TITULO}>Candidatos</h1>
          <p className="text-texto-suave">
            Personas con las que podrías convivir, de más a menos afinidad. No salen quienes
            chocan con tus imprescindibles. Si a los dos os interesa convivir, es un match.
          </p>
        </section>
        <Suspense fallback={<p className={TEXTO_SUAVE}>Buscando candidatos…</p>}>
          <ContenidoCandidatos searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function ContenidoCandidatos({ searchParams }: { searchParams: Promise<ParametrosUrl> }) {
  // Depende de la sesión del usuario: generar en cada visita, nunca por adelantado.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  // 1. Sin sesión → a iniciar sesión.
  if (!userId) {
    redirect("/login");
  }

  // 2. Perfil completo (igual que perfilEstaCompleto de test/datos.ts), y además su rol,
  //    que decide qué tarjetas y filtros se ven. Si no está completo → a /perfil.
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

  // 3. Sin test hecho → al test.
  const hecho = await yaHizoElTest(supabase, userId);
  if (hecho === null) {
    return <MensajeError />;
  }
  if (!hecho) {
    redirect("/test");
  }

  // 4. Filtros de la dirección (lo que no es válido se ignora).
  const filtros = leerFiltros(await searchParams, miRol);

  // 5. La base de datos decide quién sale (migración 0007): solo devuelve ids y porcentajes.
  const { data: filas, error } = await supabase.rpc("mis_candidatos", {
    filtro_zona: filtros.zona,
    filtro_presupuesto_max: filtros.presupuestoMax,
    filtro_tipo: filtros.tipo,
  });

  if (error || !Array.isArray(filas)) {
    return (
      <>
        <FiltrosCandidatos filtros={filtros} miRol={miRol} />
        <MensajeError />
      </>
    );
  }

  const candidatos = await cargarCandidatos(
    supabase,
    filas as { usuario_id: string; afinidad: number | null }[],
  );

  return (
    <>
      <FiltrosCandidatos filtros={filtros} miRol={miRol} />
      {candidatos === null ? (
        <MensajeError />
      ) : (
        <ListaCandidatos
          candidatos={candidatos}
          miRol={miRol}
          conFiltros={hayFiltros(filtros)}
        />
      )}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <Link href="/matches" className={ENLACE}>
          Mis matches
        </Link>
        <Link href="/perfil" className={ENLACE}>
          Volver a mi perfil
        </Link>
      </div>
    </>
  );
}

function MensajeError() {
  return (
    <Aviso tipo="error">
      No se pudieron cargar los candidatos. Recarga la página para intentarlo de nuevo.
    </Aviso>
  );
}
