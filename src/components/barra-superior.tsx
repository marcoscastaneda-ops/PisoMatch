import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cerrarSesion } from "@/app/login/actions";
import { BOTON_SECUNDARIO } from "@/components/ui";

// Barra de arriba, igual en todas las páginas (se usa en src/app/layout.tsx).
// Logo a la izquierda: 32 px de alto en móvil y 40 px en escritorio (guía de estilo, PM-41).
export function BarraSuperior() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-borde bg-white px-4 py-2 sm:px-6">
      {/* p-2: el espacio libre mínimo alrededor del logo que pide la guía (8 px). */}
      <Link
        href="/"
        className="-m-2 rounded-md p-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-menta"
      >
        <Image
          src="/logo.svg"
          alt="PisoMatch"
          width={132}
          height={32}
          preload
          className="h-8 w-auto md:h-10"
        />
      </Link>
      {/* Lee la sesión, así que va dentro de <Suspense> (Cache Components). */}
      <Suspense fallback={null}>
        <BotonSesion />
      </Suspense>
    </header>
  );
}

// Con sesión iniciada muestra «Cerrar sesión»; sin sesión, nada.
async function BotonSesion() {
  // Depende de la sesión del usuario: generar en cada visita, nunca por adelantado.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    return null;
  }

  return (
    <form action={cerrarSesion}>
      <button type="submit" className={BOTON_SECUNDARIO}>
        Cerrar sesión
      </button>
    </form>
  );
}
