import { Suspense } from "react";
import Link from "next/link";
import { BOTON_PRINCIPAL, ENLACE, TARJETA, TEXTO_SUAVE, TITULO } from "@/components/ui";
import {
  ENLACES_SIN_SESION,
  enlacesSegunSesion,
  type EnlacesPortada,
} from "@/components/portada/enlaces-portada";

// Lo primero que se ve (PM-52): qué es PisoMatch, el botón principal y los dos caminos.
// El logo ya está en la barra superior (layout.tsx), así que aquí no se repite.
export function CabeceraPortada() {
  return (
    <section className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
      <div className="flex flex-col gap-4">
        {/* TODO PM-55: texto provisional */}
        <h1 className={`${TITULO} text-balance`}>Encuentra con quién vivir, no solo dónde</h1>
        {/* TODO PM-55: texto provisional */}
        <p className="text-lg leading-[1.5]">
          Responde un test de convivencia de 15 preguntas y descubre cuánto encajas con otros
          estudiantes que buscan piso en Madrid.
        </p>
        {/* Los botones dependen de la sesión. Mientras se comprueba, se ven los de sin sesión. */}
        <Suspense fallback={<BotonesCabecera enlaces={ENLACES_SIN_SESION} />}>
          <BotonesCabeceraSegunSesion />
        </Suspense>
      </div>
      <Suspense fallback={<Caminos enlaces={ENLACES_SIN_SESION} />}>
        <CaminosSegunSesion />
      </Suspense>
    </section>
  );
}

async function BotonesCabeceraSegunSesion() {
  return <BotonesCabecera enlaces={await enlacesSegunSesion()} />;
}

async function CaminosSegunSesion() {
  return <Caminos enlaces={await enlacesSegunSesion()} />;
}

function BotonesCabecera({ enlaces }: { enlaces: EnlacesPortada }) {
  return (
    <div className="mt-2 flex flex-col gap-4">
      {/* El único botón principal de la portada (guía de estilo). */}
      <Link href={enlaces.test} className={`${BOTON_PRINCIPAL} sm:w-auto sm:self-start`}>
        {/* TODO PM-55: texto provisional («3 minutos»: la portada de PM-41 decía «unos 5») */}
        Haz el test en 3 minutos
      </Link>
      {enlaces.conSesion ? (
        <Link href="/perfil" className={`${ENLACE} self-start`}>
          Ir a mi perfil
        </Link>
      ) : (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/registro" className={ENLACE}>
            Crear cuenta
          </Link>
          <Link href="/login" className={ENLACE}>
            Iniciar sesión
          </Link>
        </div>
      )}
    </div>
  );
}

const CAMINOS = [
  {
    // TODO PM-55: texto provisional
    titulo: "Busco habitación o compañero de piso",
    // TODO PM-55: texto provisional
    texto: "Encuentra gente con la que convivir sin sustos.",
    icono: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="M20 20l-4.5-4.5" />
      </>
    ),
  },
  {
    // TODO PM-55: texto provisional
    titulo: "Tengo una habitación libre",
    // TODO PM-55: texto provisional
    texto: "Encuentra a alguien que encaje con tu piso.",
    icono: (
      <>
        <path d="M4 11l8-6 8 6" />
        <path d="M6 10v9h12v-9" />
        <path d="M10 19v-5h4v5" />
      </>
    ),
  },
];

function Caminos({ enlaces }: { enlaces: EnlacesPortada }) {
  return (
    <nav aria-labelledby="titulo-caminos" className="flex flex-col gap-3">
      {/* TODO PM-55: texto provisional */}
      <p id="titulo-caminos" className="font-semibold">
        ¿Qué buscas?
      </p>
      <ul className="flex flex-col gap-3">
        {CAMINOS.map((camino) => (
          <li key={camino.titulo}>
            <Link
              href={enlaces.caminos}
              className={`${TARJETA} flex items-center gap-4 transition-shadow hover:shadow-media focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-menta focus-visible:ring-offset-2`}
            >
              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-melocoton text-marino"
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
                  {camino.icono}
                </svg>
              </span>
              <span className="flex flex-1 flex-col gap-1">
                <span className="leading-[1.3] font-semibold">{camino.titulo}</span>
                <span className={TEXTO_SUAVE}>{camino.texto}</span>
              </span>
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
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
