import type { ReactNode } from "react";
import { ETIQUETA_MAYUSCULAS, SUBTITULO, TARJETA } from "@/components/ui";

// «Cómo funciona» en 4 pasos: test → afinidad → match → contacto (PM-52).
const PASOS: { titulo: string; texto: string; icono: ReactNode }[] = [
  {
    // TODO PM-55: texto provisional
    titulo: "Haz el test",
    // TODO PM-55: texto provisional
    texto: "15 preguntas sobre horarios, limpieza, ruido o visitas. Tú decides qué te importa más.",
    icono: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V3h6v1" />
        <path d="M8.5 10.5l1.5 1.5 3-3M8.5 16.5l1.5 1.5 3-3" />
        <path d="M15.5 11h.5M15.5 17h.5" />
      </>
    ),
  },
  {
    // TODO PM-55: texto provisional
    titulo: "Mira tu afinidad",
    // TODO PM-55: texto provisional
    texto: "Te enseñamos tu porcentaje de afinidad con cada persona que ha hecho el test.",
    icono: (
      <>
        <path d="M5 19L19 5" />
        <circle cx="7" cy="7" r="2.5" />
        <circle cx="17" cy="17" r="2.5" />
      </>
    ),
  },
  {
    // TODO PM-55: texto provisional
    titulo: "Haz match",
    // TODO PM-55: texto provisional
    texto: "Si a los dos os interesa convivir, es un match.",
    icono: (
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    ),
  },
  {
    // TODO PM-55: texto provisional
    titulo: "Poneos en contacto",
    // TODO PM-55: texto provisional
    texto: "Con el match, cada uno ve el correo del otro para conoceros.",
    icono: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3.5 6.5L12 13l8.5-6.5" />
      </>
    ),
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" aria-labelledby="titulo-como-funciona" className="flex flex-col gap-6">
      <h2 id="titulo-como-funciona" className={SUBTITULO}>
        Cómo funciona
      </h2>
      <ol className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {PASOS.map((paso, i) => (
          <li key={paso.titulo} className={`${TARJETA} flex gap-4 lg:flex-col`}>
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-menta text-marino"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {paso.icono}
              </svg>
            </span>
            <div className="flex flex-col gap-1">
              <p className={ETIQUETA_MAYUSCULAS}>Paso {i + 1}</p>
              <h3 className="text-lg leading-[1.3] font-semibold">{paso.titulo}</h3>
              <p className="text-texto-suave">{paso.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
