import type { ReactNode } from "react";
import Link from "next/link";
import { ENLACE_EN_TEXTO, SUBTITULO, TARJETA } from "@/components/ui";
import { Proximamente } from "@/components/portada/proximamente";

// Confianza y privacidad (PM-52). Solo promete lo que la web hace (o lo marca «Próximamente»).
export function Confianza() {
  return (
    <section aria-labelledby="titulo-confianza" className="flex flex-col gap-6">
      {/* TODO PM-55: texto provisional */}
      <h2 id="titulo-confianza" className={SUBTITULO}>
        Tus datos, en tus manos
      </h2>
      <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
        <Garantia
          icono={
            <>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3.5 6.5L12 13l8.5-6.5" />
            </>
          }
        >
          {/* TODO PM-55: texto provisional */}
          <p>Tu correo solo lo ve otra persona si los dos os interesáis.</p>
          {/* TODO PM-36/PM-39: quitar Próximamente cuando el match funcione */}
          <Proximamente />
        </Garantia>
        <Garantia
          icono={
            <>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </>
          }
        >
          {/* TODO PM-55: texto provisional */}
          <p>Tus datos son privados. Nadie ve tus respuestas: solo sirven para calcular la afinidad.</p>
        </Garantia>
        <Garantia
          icono={
            <>
              <path d="M4 7h16" />
              <path d="M9 7V4h6v3" />
              <path d="M6 7l1 13h10l1-13" />
            </>
          }
        >
          {/* TODO PM-55: texto provisional */}
          <p>
            Puedes pedir que borremos tu cuenta y tus datos.{" "}
            <Link href="/privacidad" className={ENLACE_EN_TEXTO}>
              Cómo usamos tus datos
            </Link>
          </p>
        </Garantia>
      </ul>
    </section>
  );
}

function Garantia({ icono, children }: { icono: ReactNode; children: ReactNode }) {
  return (
    <li className={`${TARJETA} flex gap-4`}>
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-crema text-verde"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icono}
        </svg>
      </span>
      <div className="flex flex-col items-start gap-2">{children}</div>
    </li>
  );
}
