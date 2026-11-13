import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FormularioBienvenida } from "./formulario-bienvenida";
import { FormularioPrivacidad } from "./formulario-privacidad";
import { FormularioPerfil } from "./formulario-perfil";
import { yaHizoElTest } from "@/app/test/datos";
import { esRolValido, type Rol } from "./roles";
import { BUCKET_FOTOS, type ValoresDatos } from "./datos-perfil";
import {
  Aviso,
  BOTON_SECUNDARIO,
  COLUMNA_ESTRECHA,
  ENLACE,
  PAGINA,
  SEPARACION_SECCIONES,
  SUBTITULO,
  TARJETA,
  TEXTO_SUAVE,
  TITULO,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Mi perfil · PisoMatch",
};

// Datos del perfil que usa esta página.
type Perfil = {
  nombre: string;
  rol: Rol;
  fotoUrl: string | null; // enlace temporal (1 hora) a la foto, o null
  datos: ValoresDatos & { rol: Rol }; // lo que se rellena en «Tu rol» y «Tus datos» (PM-13)
  hizoElTest: boolean; // para el botón «Hacer el test» / «Repetir el test»
};

// Duración del enlace temporal a la foto privada, en segundos.
const DURACION_ENLACE_FOTO = 60 * 60;

export default function PaginaPerfil() {
  return (
    <main className={PAGINA}>
      <div className={`${COLUMNA_ESTRECHA} ${SEPARACION_SECCIONES}`}>
        <Suspense
          fallback={<p className={TEXTO_SUAVE}>Cargando tu perfil…</p>}
        >
          <ContenidoPerfil />
        </Suspense>
      </div>
    </main>
  );
}

// Decide qué pantalla enseñar según la sesión y si ya existe el perfil.
async function ContenidoPerfil() {
  // Depende de la sesión del usuario: generar en cada visita, nunca por adelantado.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  // 1. Sin sesión → a iniciar sesión.
  if (!userId) {
    redirect("/login");
  }

  const { data: fila, error } = await supabase
    .from("profiles")
    .select(
      "nombre, rol, acepta_privacidad, foto_url, descripcion, presupuesto, zona, fecha_entrada",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return (
      <Aviso tipo="error">
        No se pudo cargar tu perfil. Recarga la página para intentarlo de nuevo.
      </Aviso>
    );
  }

  // 2. Con sesión pero sin perfil → bienvenida (nombre + rol + privacidad).
  if (!fila || !esRolValido(fila.rol)) {
    return <FormularioBienvenida />;
  }

  // 3. Perfil creado antes de PM-24 sin aceptar la privacidad → pedir que la acepte.
  if (fila.acepta_privacidad !== true) {
    return <FormularioPrivacidad nombre={fila.nombre} />;
  }

  // 4. Con perfil → ver y editar datos, foto y rol.
  // La foto es privada: pedimos a Supabase un enlace temporal. Si falla (por ejemplo,
  // porque aún no se ha ejecutado la migración 0004), se enseña la inicial y ya está.
  let fotoUrl: string | null = null;
  if (fila.foto_url) {
    const { data: firmada } = await supabase.storage
      .from(BUCKET_FOTOS)
      .createSignedUrl(fila.foto_url, DURACION_ENLACE_FOTO);
    fotoUrl = firmada?.signedUrl ?? null;
  }

  // Si no se puede comprobar (null), se enseña «Hacer el test», que es lo más prudente.
  const hizoElTest = (await yaHizoElTest(supabase, userId)) === true;

  return (
    <VistaPerfil
      perfil={{
        nombre: fila.nombre,
        rol: fila.rol,
        fotoUrl,
        hizoElTest,
        datos: {
          rol: fila.rol,
          nombre: fila.nombre,
          descripcion: fila.descripcion ?? "",
          presupuesto: fila.presupuesto == null ? "" : String(Number(fila.presupuesto)),
          zona: fila.zona ?? "",
          fecha_entrada: fila.fecha_entrada ?? "",
        },
      }}
    />
  );
}

function VistaPerfil({ perfil }: { perfil: Perfil }) {
  return (
    <>
      <h1 className={TITULO}>
        Hola, {perfil.nombre}
      </h1>

      {/* «Tu rol» y «Tus datos», con un solo botón «Guardar cambios». */}
      <FormularioPerfil valoresIniciales={perfil.datos} fotoUrl={perfil.fotoUrl} />

      <section className={`${TARJETA} flex flex-col gap-3`}>
        <h2 className={SUBTITULO}>
          Test de convivencia
        </h2>
        <p className="text-texto-suave">
          Cuéntanos cómo vives para encontrar compañeros compatibles.
        </p>
        <Link
          href="/test"
          className={`${BOTON_SECUNDARIO} mt-1 w-full sm:w-auto sm:self-start`}
        >
          {perfil.hizoElTest ? "Repetir el test" : "Hacer el test"}
        </Link>
        <Link
          href="/test/respuestas"
          className={`${ENLACE} self-start`}
        >
          Mis respuestas
        </Link>
      </section>

      <section className={`${TARJETA} flex flex-col gap-3`}>
        <h2 className={SUBTITULO}>
          Afinidad
        </h2>
        <p className="text-texto-suave">
          Mira con quién encajas mejor según el test de convivencia.
        </p>
        <Link
          href="/afinidad"
          className={`${BOTON_SECUNDARIO} mt-1 w-full sm:w-auto sm:self-start`}
        >
          Ver mi afinidad
        </Link>
      </section>

      <section className={`${TARJETA} flex flex-col gap-3`}>
        <h2 className={SUBTITULO}>
          Candidatos
        </h2>
        <p className="text-texto-suave">
          Personas compatibles contigo, sin quienes chocan con tus imprescindibles. Puedes
          filtrar por zona y presupuesto.
        </p>
        <Link
          href="/candidatos"
          className={`${BOTON_SECUNDARIO} mt-1 w-full sm:w-auto sm:self-start`}
        >
          Ver candidatos
        </Link>
      </section>
    </>
  );
}
