import type { ReactNode } from "react";
import Link from "next/link";
import {
  BOTON_PRINCIPAL,
  BOTON_SECUNDARIO,
  ENLACE_EN_TEXTO,
  ETIQUETA_MAYUSCULAS,
  InsigniaAfinidad,
  PAGINA,
  SEPARACION_SECCIONES,
  SUBTITULO,
  TARJETA,
  TEXTO_SUAVE,
  TITULO,
} from "@/components/ui";

// Página de inicio (PM-41): qué es PisoMatch en pocos segundos y «Cómo funciona».
// Pública: no lee la sesión ni Supabase.
export default function Home() {
  return (
    <main className={PAGINA}>
      <div className={`flex w-full max-w-[1120px] flex-col ${SEPARACION_SECCIONES}`}>
        <Portada />
        <ComoFunciona />
        <Cierre />
      </div>
    </main>
  );
}

// Lo que se ve sin hacer scroll en el móvil: qué es y el botón para empezar.
function Portada() {
  return (
    <section className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
      <div className="flex flex-col gap-4">
        <p className={ETIQUETA_MAYUSCULAS}>Compañeros de piso</p>
        <h1 className={`${TITULO} text-balance`}>Encuentra compañeros de piso que viven como tú</h1>
        <p className="text-lg leading-[1.5]">
          Responde un test de convivencia y te enseñamos cuánto encajas con cada persona. Son
          unos 5 minutos.
        </p>
        <div className="mt-2 flex flex-col gap-3">
          <Link href="/registro" className={`${BOTON_PRINCIPAL} sm:w-auto sm:self-start`}>
            Empezar
          </Link>
          <p className="text-sm text-texto-suave">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className={ENLACE_EN_TEXTO}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
      <EjemploAfinidad />
    </section>
  );
}

// Ilustración: cómo se ve la lista de afinidad (/afinidad). Los nombres son de ejemplo.
const EJEMPLO = [
  { nombre: "Lucía", afinidad: 92 },
  { nombre: "Dani", afinidad: 78 },
  { nombre: "Sara", afinidad: 64 },
];

function EjemploAfinidad() {
  return (
    <figure className={`${TARJETA} flex flex-col gap-4`}>
      <figcaption className="flex items-center justify-between gap-2">
        <span className="font-semibold">Tu afinidad</span>
        <span className={TEXTO_SUAVE}>Ejemplo</span>
      </figcaption>
      <ul className="flex flex-col gap-3">
        {EJEMPLO.map((persona) => (
          <li
            key={persona.nombre}
            className="flex items-center gap-3 rounded-md border border-borde p-3"
          >
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-melocoton font-bold text-marino"
            >
              {persona.nombre.charAt(0)}
            </span>
            <span className="flex-1 font-semibold">{persona.nombre}</span>
            <InsigniaAfinidad>{persona.afinidad} %</InsigniaAfinidad>
          </li>
        ))}
      </ul>
    </figure>
  );
}

const PASOS: { titulo: string; texto: string; icono: ReactNode }[] = [
  {
    titulo: "Crea tu cuenta",
    texto: "Solo necesitas un correo y una contraseña. Luego cuéntanos si buscas habitación o tienes una libre.",
    icono: (
      <>
        <circle cx="10" cy="8" r="4" />
        <path d="M3 20c0-3.9 3.1-7 7-7 1.4 0 2.7.4 3.8 1.1" />
        <path d="M18 14v6M15 17h6" />
      </>
    ),
  },
  {
    titulo: "Haz el test de convivencia",
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
    titulo: "Mira con quién encajas",
    texto: "Te enseñamos tu porcentaje de afinidad con cada persona que ha hecho el test.",
    icono: (
      <>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        <path d="M9.5 13.5l5-5" />
        <circle cx="9.5" cy="9" r=".6" fill="currentColor" />
        <circle cx="14.5" cy="13" r=".6" fill="currentColor" />
      </>
    ),
  },
];

function ComoFunciona() {
  return (
    <section id="como-funciona" aria-labelledby="titulo-como-funciona" className="flex flex-col gap-6">
      <h2 id="titulo-como-funciona" className={SUBTITULO}>
        Cómo funciona
      </h2>
      <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
        {PASOS.map((paso, i) => (
          <li key={paso.titulo} className={`${TARJETA} flex gap-4 md:flex-col`}>
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
      <p className="flex items-start gap-3 text-sm leading-[1.4] text-texto-suave">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-5 shrink-0 text-verde"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        <span>
          Nadie ve tus respuestas: solo sirven para calcular la afinidad.{" "}
          <Link href="/privacidad" className={ENLACE_EN_TEXTO}>
            Cómo usamos tus datos
          </Link>
        </span>
      </p>
    </section>
  );
}

// Cierre con el lema de la marca, sobre fondo marino.
function Cierre() {
  return (
    <section className="flex flex-col items-start gap-4 rounded-lg bg-marino p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
      <p className="text-xl leading-[1.3] font-bold tracking-[-0.01em] text-balance md:text-2xl">
        Que nadie elija con quién vivir a ciegas.
      </p>
      <Link href="/registro" className={`${BOTON_SECUNDARIO} w-full shrink-0 md:w-auto`}>
        Crear mi cuenta
      </Link>
    </section>
  );
}
