import type { ReactNode } from "react";
import Image from "next/image";
import type { Rol } from "@/app/perfil/roles";
import {
  AVATAR,
  AVATAR_GRANDE,
  ETIQUETA_ROL,
  InsigniaAfinidad,
  NOMBRE_TARJETA,
  TARJETA,
  TEXTO_SUAVE,
} from "@/components/ui";

// Lo que se enseña de cada candidato. Nada más de su perfil (ni correo ni descripción).
export type Candidato = {
  id: string;
  nombre: string;
  rol: Rol;
  zona: string | null;
  presupuesto: number | null; // euros al mes
  fotoUrl: string | null; // enlace temporal (1 hora) a la foto, o null
  afinidad: number;
};

const SIN_INDICAR = "Sin indicar";

// Cómo se describe el rol del candidato, según quién mira (decisión del PO en PM-35):
// un inquilino ve «Tiene habitación» / «También busca piso»; un anfitrión solo ve
// inquilinos, y para él son «Busca habitación».
// También la usa «Mis matches» (PM-36).
export function etiquetaRolCandidato(rolCandidato: Rol, miRol: Rol) {
  if (miRol === "anfitrion") return "Busca habitación";
  return rolCandidato === "anfitrion" ? "Tiene habitación" : "También busca piso";
}

// Círculo con la foto, o la inicial si no tiene (PM-56). También lo usan «Mis matches»
// y la ventana de match (grande).
export function FotoCandidato({
  nombre,
  fotoUrl,
  grande = false,
}: {
  nombre: string;
  fotoUrl: string | null;
  grande?: boolean;
}) {
  return (
    <div className={grande ? AVATAR_GRANDE : AVATAR}>
      {fotoUrl ? (
        <Image
          src={fotoUrl}
          alt={`Foto de ${nombre}`}
          fill
          unoptimized
          sizes={grande ? "64px" : "48px"}
          className="object-cover"
        />
      ) : (
        <span aria-hidden>{nombre.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

// Cabecera común de las tarjetas de candidato y de match: círculo, nombre y rol.
export function CabeceraPersona({
  persona,
  miRol,
}: {
  persona: Pick<Candidato, "nombre" | "fotoUrl" | "rol">;
  miRol: Rol;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <FotoCandidato nombre={persona.nombre} fotoUrl={persona.fotoUrl} />
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className={`${NOMBRE_TARJETA} break-words`}>{persona.nombre}</h2>
        <span className={ETIQUETA_ROL}>{etiquetaRolCandidato(persona.rol, miRol)}</span>
      </div>
    </div>
  );
}

export function TarjetaCandidato({
  candidato,
  miRol,
  acciones,
}: {
  candidato: Candidato;
  miRol: Rol;
  // Final de la tarjeta: botones «Descartar» / «Me interesa» o la confirmación (PM-36, PM-56).
  acciones?: ReactNode;
}) {
  const presupuesto =
    candidato.presupuesto === null
      ? SIN_INDICAR
      : `${candidato.presupuesto.toLocaleString("es-ES")} €/mes`;

  return (
    <article className={`${TARJETA} flex h-full flex-col gap-4`}>
      <div className="flex items-start justify-between gap-3">
        <CabeceraPersona persona={candidato} miRol={miRol} />
        <InsigniaAfinidad>
          {candidato.afinidad} %<span className="sr-only"> de afinidad</span>
        </InsigniaAfinidad>
      </div>

      <dl className={`${TEXTO_SUAVE} flex flex-col gap-1`}>
        <div>
          <dt className="inline">Zona</dt>
          <dd className="inline">
            <span aria-hidden> · </span>
            <span className="text-marino">{candidato.zona ?? SIN_INDICAR}</span>
          </dd>
        </div>
        <div>
          <dt className="inline">Presupuesto</dt>
          <dd className="inline">
            <span aria-hidden> · </span>
            <span className="text-marino">{presupuesto}</span>
          </dd>
        </div>
      </dl>

      {acciones ? <div className="mt-auto">{acciones}</div> : null}
    </article>
  );
}
