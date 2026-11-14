import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { yaHizoElTest } from "@/app/test/datos";
import { esRolValido, type Rol } from "@/app/perfil/roles";
import { BUCKET_FOTOS } from "@/app/perfil/datos-perfil";
import { FiltrosCandidatos } from "./filtros-candidatos";
import { TarjetaCandidato, type Candidato } from "./tarjeta-candidato";
import { hayFiltros, leerFiltros, type Filtros } from "./filtros";
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

// Duración del enlace temporal a cada foto privada, en segundos (igual que en /perfil).
const DURACION_ENLACE_FOTO = 60 * 60;

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
            chocan con tus imprescindibles.
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
        <ListaCandidatos candidatos={candidatos} miRol={miRol} filtros={filtros} />
      )}
      <Link href="/perfil" className={`${ENLACE} self-start`}>
        Volver a mi perfil
      </Link>
    </>
  );
}

// Datos de cada candidato (profiles es visible para usuarios con sesión) y enlaces
// temporales a sus fotos, todos de una vez. Devuelve null si algo falla.
async function cargarCandidatos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filas: { usuario_id: string; afinidad: number | null }[],
): Promise<Candidato[] | null> {
  const ids = filas.map((fila) => fila.usuario_id);
  if (ids.length === 0) return [];

  const { data: perfiles, error } = await supabase
    .from("profiles")
    .select("id, nombre, rol, zona, presupuesto, foto_url")
    .in("id", ids);
  if (error || !perfiles) return null;

  // Si fallan los enlaces de las fotos, se enseña la inicial y ya está.
  const rutasFotos = perfiles.map((perfil) => perfil.foto_url).filter((ruta): ruta is string => !!ruta);
  const enlaces = new Map<string, string>();
  if (rutasFotos.length > 0) {
    const { data: firmadas } = await supabase.storage
      .from(BUCKET_FOTOS)
      .createSignedUrls(rutasFotos, DURACION_ENLACE_FOTO);
    firmadas?.forEach((firmada) => {
      if (firmada.path && firmada.signedUrl) enlaces.set(firmada.path, firmada.signedUrl);
    });
  }

  const porId = new Map(perfiles.map((perfil) => [perfil.id, perfil]));

  // Se mantiene el orden de la base de datos: de mayor a menor afinidad.
  return filas.flatMap((fila) => {
    const perfil = porId.get(fila.usuario_id);
    if (!perfil || fila.afinidad === null || !esRolValido(perfil.rol)) return [];
    return [
      {
        id: perfil.id,
        nombre: perfil.nombre,
        rol: perfil.rol,
        zona: perfil.zona || null,
        presupuesto: perfil.presupuesto == null ? null : Number(perfil.presupuesto),
        fotoUrl: perfil.foto_url ? (enlaces.get(perfil.foto_url) ?? null) : null,
        afinidad: fila.afinidad,
      },
    ];
  });
}

function ListaCandidatos({
  candidatos,
  miRol,
  filtros,
}: {
  candidatos: Candidato[];
  miRol: Rol;
  filtros: Filtros;
}) {
  if (candidatos.length === 0) {
    return hayFiltros(filtros) ? (
      <p className="text-texto-suave">
        Nadie cumple estos filtros. Prueba con otros o pulsa «Quitar filtros».
      </p>
    ) : (
      <p className="text-texto-suave">
        Todavía no hay candidatos compatibles. Vuelve en unos días.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4" aria-label="Lista de candidatos">
      <p className={TEXTO_SUAVE} role="status">
        {candidatos.length === 1 ? "1 candidato" : `${candidatos.length} candidatos`}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidatos.map((candidato) => (
          <li key={candidato.id}>
            {/* PM-36 añadirá aquí acciones={…} con «Me interesa». */}
            <TarjetaCandidato candidato={candidato} miRol={miRol} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function MensajeError() {
  return (
    <Aviso tipo="error">
      No se pudieron cargar los candidatos. Recarga la página para intentarlo de nuevo.
    </Aviso>
  );
}
