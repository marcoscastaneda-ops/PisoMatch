import { Suspense } from "react";
import Link from "next/link";
import { BOTON_SECUNDARIO } from "@/components/ui";
import {
  ENLACES_SIN_SESION,
  enlacesSegunSesion,
  type EnlacesPortada,
} from "@/components/portada/enlaces-portada";

// Llamada final a hacer el test, sobre fondo marino, con el lema de la marca (guía de estilo).
// El botón es secundario: el principal de la portada ya es el de la cabecera.
export function LlamadaFinal() {
  return (
    <section className="flex flex-col items-start gap-4 rounded-lg bg-marino p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-xl leading-[1.3] font-bold tracking-[-0.01em] text-balance md:text-2xl">
          Que nadie elija con quién vivir a ciegas.
        </p>
        {/* TODO PM-55: texto provisional */}
        <p>Haz el test y descubre con quién encajas de verdad.</p>
      </div>
      <Suspense fallback={<BotonFinal enlaces={ENLACES_SIN_SESION} />}>
        <BotonFinalSegunSesion />
      </Suspense>
    </section>
  );
}

async function BotonFinalSegunSesion() {
  return <BotonFinal enlaces={await enlacesSegunSesion()} />;
}

function BotonFinal({ enlaces }: { enlaces: EnlacesPortada }) {
  return (
    <Link href={enlaces.test} className={`${BOTON_SECUNDARIO} w-full shrink-0 md:w-auto`}>
      {/* TODO PM-55: texto provisional */}
      Hacer el test
    </Link>
  );
}
