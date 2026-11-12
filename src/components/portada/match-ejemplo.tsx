import { SUBTITULO, TARJETA, TEXTO_SUAVE } from "@/components/ui";

// Un match de ejemplo (PM-52). Laura es inventada: no usar nunca datos de usuarios reales.
const MOTIVOS = [
  // TODO PM-55: texto provisional
  "Los dos os acostáis antes de las 12 entre semana.",
  // TODO PM-55: texto provisional
  "Preferís avisar antes de traer visitas a casa.",
];

export function MatchEjemplo() {
  return (
    <section
      aria-labelledby="titulo-match-ejemplo"
      className="grid gap-6 md:grid-cols-2 md:items-center md:gap-12"
    >
      <div className="flex flex-col gap-2">
        {/* TODO PM-55: texto provisional */}
        <h2 id="titulo-match-ejemplo" className={SUBTITULO}>
          Así se ve cuando encajas con alguien
        </h2>
        {/* TODO PM-55: texto provisional */}
        <p className="text-texto-suave">
          Comparamos vuestras respuestas y te contamos en qué coincidís.
        </p>
      </div>
      <figure className={`${TARJETA} flex flex-col gap-4`}>
        <figcaption className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-melocoton font-bold text-marino"
            >
              L
            </span>
            {/* TODO PM-55: texto provisional */}
            <span className="text-lg font-semibold">Laura y tú</span>
          </span>
          <span className={TEXTO_SUAVE}>Ejemplo</span>
        </figcaption>
        {/* Cifra de afinidad de la guía: 32 px en móvil y 40 px en escritorio, marino sobre menta. */}
        <p className="self-start rounded-md bg-menta px-4 py-3 text-[32px] leading-none font-bold text-marino md:text-[40px]">
          87 %
        </p>
        <ul className="flex flex-col gap-2">
          {MOTIVOS.map((motivo) => (
            <li key={motivo} className="flex items-start gap-2">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="mt-0.5 size-5 shrink-0 text-verde"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
              <span>{motivo}</span>
            </li>
          ))}
        </ul>
        {/* TODO PM-55: texto provisional */}
        <p className={TEXTO_SUAVE}>Laura no existe: es un ejemplo para que veas cómo funciona.</p>
      </figure>
    </section>
  );
}
