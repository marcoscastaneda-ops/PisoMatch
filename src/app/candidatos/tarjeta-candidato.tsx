import type { ReactNode } from "react";
import Image from "next/image";
import type { Rol } from "@/app/perfil/roles";
import {
  FOTO_TARJETA,
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

// Foto arriba de la tarjeta, o la inicial si no tiene. También la usa «Mis matches» (PM-36).
export function FotoCandidato({ nombre, fotoUrl }: { nombre: string; fotoUrl: string | null }) {
  return (
    <div className={FOTO_TARJETA}>
      {fotoUrl ? (
        <Image
          src={fotoUrl}
          alt={`Foto de ${nombre}`}
          fill
          unoptimized
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-full items-center justify-center text-5xl font-bold text-marino"
        >
          {nombre.charAt(0).toUpperCase()}
        </span>
      )}
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
  // Botones al final de la tarjeta: «Me interesa» y «Descartar» (PM-36).
  acciones?: ReactNode;
}) {
  const presupuesto =
    candidato.presupuesto === null
      ? SIN_INDICAR
      : `${candidato.presupuesto.toLocaleString("es-ES")} €/mes`;

  return (
    <article className={`${TARJETA} flex h-full flex-col gap-4`}>
      <FotoCandidato nombre={candidato.nombre} fotoUrl={candidato.fotoUrl} />

      <div className="flex items-start justify-between gap-3">
        <h2 className={`${NOMBRE_TARJETA} min-w-0 break-words`}>{candidato.nombre}</h2>
        <InsigniaAfinidad>
          {candidato.afinidad} %<span className="sr-only"> de afinidad</span>
        </InsigniaAfinidad>
      </div>

      <dl className={`${TEXTO_SUAVE} grid grid-cols-[auto_1fr] gap-x-3 gap-y-1`}>
        <dt className="font-semibold">Rol</dt>
        <dd>{etiquetaRolCandidato(candidato.rol, miRol)}</dd>
        <dt className="font-semibold">Zona</dt>
        <dd>{candidato.zona ?? SIN_INDICAR}</dd>
        <dt className="font-semibold">Presupuesto</dt>
        <dd>{presupuesto}</dd>
      </dl>

      {acciones ? <div className="mt-auto flex flex-col gap-2">{acciones}</div> : null}
    </article>
  );
}
