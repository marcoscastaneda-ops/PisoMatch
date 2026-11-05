import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FormularioBienvenida } from "./formulario-bienvenida";
import { FormularioPrivacidad } from "./formulario-privacidad";
import { SelectorRol } from "./selector-rol";
import { FormularioDatos } from "./formulario-datos";
import { FormularioFoto } from "./formulario-foto";
import { esRolValido, etiquetaDeRol, type Rol } from "./roles";
import { BUCKET_FOTOS, type ValoresDatos } from "./datos-perfil";

export const metadata: Metadata = {
  title: "Mi perfil · PisoMatch",
};

// Datos del perfil que usa esta página.
type Perfil = {
  nombre: string;
  rol: Rol;
  fotoUrl: string | null; // enlace temporal (1 hora) a la foto, o null
  datos: ValoresDatos; // lo que se rellena en «Tus datos» (PM-13)
};

// Duración del enlace temporal a la foto privada, en segundos.
const DURACION_ENLACE_FOTO = 60 * 60;

export default function PaginaPerfil() {
  return (
    <main className="flex flex-1 justify-center bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="flex w-full max-w-md flex-col gap-8">
        <Suspense
          fallback={<p className="text-sm text-zinc-500">Cargando tu perfil…</p>}
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
      <p className="text-sm text-red-600">
        No se pudo cargar tu perfil. Recarga la página para intentarlo de nuevo.
      </p>
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

  return (
    <VistaPerfil
      perfil={{
        nombre: fila.nombre,
        rol: fila.rol,
        fotoUrl,
        datos: {
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
      <section className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Hola, {perfil.nombre}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Ahora mismo: <strong>{etiquetaDeRol(perfil.rol)}</strong>
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Tus datos
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Así te verán los demás. El presupuesto y la zona sirven para encontrar tus matches.
          </p>
        </div>
        <FormularioFoto fotoUrl={perfil.fotoUrl} nombre={perfil.nombre} />
        <FormularioDatos valoresIniciales={perfil.datos} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Test de convivencia
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Cuéntanos cómo vives para encontrar compañeros compatibles.
        </p>
        <Link
          href="/test"
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Test
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Tu rol
        </h2>
        <SelectorRol rolActual={perfil.rol} />
      </section>
    </>
  );
}
