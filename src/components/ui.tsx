import type { ReactNode } from "react";

/*
  Piezas visuales reutilizables de PisoMatch (PM-41), según docs/guia-estilo.md.
  Úsalas en todas las pantallas nuevas en vez de repetir clases.

  - Las constantes (BOTON_PRINCIPAL, CAMPO…) son clases de Tailwind: sirven igual
    para <button>, <Link>, <input>, etc. Ej.: <Link href="/test" className={BOTON_PRINCIPAL}>.
  - Los componentes (Aviso, ErrorDeCampo, InsigniaAfinidad) no usan estado, así que
    funcionan tanto en componentes de servidor como en los "use client".
  - Casillas y botones de opción: className="casilla" / "opcion" (están en globals.css).
*/

// ─── Página ──────────────────────────────────────────────────────────────────

// <main> de cada página: margen lateral 16 px en móvil y 24 px desde tablet.
export const PAGINA = "flex flex-1 justify-center px-4 py-8 sm:px-6 md:py-12";
// Columna de formularios y test: máximo 480 px. Añade la separación que toque:
// entre secciones, SEPARACION_SECCIONES; entre campos de un formulario, gap-4 (16 px).
export const COLUMNA_ESTRECHA = "flex w-full max-w-[480px] flex-col";
// Separación entre secciones: 32 px en móvil y 48 px en escritorio.
export const SEPARACION_SECCIONES = "gap-8 md:gap-12";

// ─── Textos ──────────────────────────────────────────────────────────────────

export const TITULO =
  "text-[28px] leading-[1.2] font-bold tracking-[-0.01em] text-marino md:text-[36px]";
export const SUBTITULO =
  "text-xl leading-[1.3] font-bold tracking-[-0.01em] text-marino md:text-2xl";
// Texto secundario (ayudas, explicaciones cortas): 13 px en móvil, 14 px en escritorio.
export const TEXTO_SUAVE = "text-[13px] leading-[1.4] text-texto-suave md:text-sm";
// Etiqueta corta en mayúsculas (máximo 3 palabras), como el bloque del test.
export const ETIQUETA_MAYUSCULAS =
  "text-xs font-semibold uppercase tracking-[0.08em] text-texto-suave";

// Etiqueta pequeña de calidez (fondo melocotón, texto marino: el melocotón nunca va como color
// de texto). Ej.: «Suele ser imprescindible» en el test.
export const ETIQUETA_SUGERENCIA =
  "self-start rounded-sm bg-melocoton px-2 py-1 text-[13px] leading-[1.4] font-semibold text-marino";

// ─── Botones ─────────────────────────────────────────────────────────────────

const BOTON =
  "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-center text-base leading-none font-semibold transition-colors " +
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-menta focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-desactivado disabled:text-desactivado-texto";

// La acción más importante de la pantalla (solo uno por pantalla). En móvil ocupa todo el ancho.
export const BOTON_PRINCIPAL = `${BOTON} w-full bg-marino text-white hover:bg-marino-hover`;
// El resto de acciones.
export const BOTON_SECUNDARIO = `${BOTON} border-2 border-marino bg-white text-marino hover:bg-crema`;

// Enlace suelto («Volver a mi perfil»): verde, subrayado al pasar.
export const ENLACE =
  "rounded-sm font-semibold text-verde underline-offset-4 hover:underline " +
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-menta focus-visible:ring-offset-2";
// Enlace dentro de una frase: siempre subrayado, para no distinguirlo solo por el color.
export const ENLACE_EN_TEXTO = `${ENLACE} underline`;

// ─── Formularios ─────────────────────────────────────────────────────────────

// Grupo etiqueta + campo + ayuda/error (6 px entre la etiqueta y el campo).
export const GRUPO_CAMPO = "flex flex-col gap-1.5";
export const ETIQUETA = "text-sm font-semibold text-marino";

const CAMPO_BASE =
  "w-full rounded-md border-[1.5px] border-borde-campo bg-white px-4 text-base text-marino placeholder:text-texto-suave " +
  "focus:border-2 focus:border-verde focus:outline-none focus:ring-[3px] focus:ring-menta/35 " +
  "aria-[invalid=true]:border-2 aria-[invalid=true]:border-error focus:aria-[invalid=true]:border-error " +
  "disabled:cursor-not-allowed disabled:border-borde disabled:bg-desactivado disabled:text-desactivado-texto";

// <input> y <select>: 48 px de alto, texto de 16 px (así el iPhone no hace zoom).
export const CAMPO = `${CAMPO_BASE} h-12`;
// <textarea>
export const AREA_TEXTO = `${CAMPO_BASE} min-h-28 py-3`;

// Tarjeta con un botón de opción dentro (rol, respuestas del test). Se resalta al marcarla.
export const TARJETA_OPCION =
  "flex min-h-12 cursor-pointer items-start gap-3 rounded-md border-[1.5px] border-borde bg-white p-4 text-marino transition-colors " +
  "hover:border-borde-campo has-[:checked]:border-verde has-[:checked]:ring-1 has-[:checked]:ring-verde";

// ─── Tarjetas ────────────────────────────────────────────────────────────────

export const TARJETA = "rounded-lg border border-borde bg-white p-4 shadow-suave md:p-6";

// ─── Componentes ─────────────────────────────────────────────────────────────

const ESTILO_AVISO = {
  exito: "bg-exito-fondo text-exito",
  error: "bg-error-fondo text-error",
  aviso: "bg-aviso-fondo text-aviso",
} as const;

// Mensaje de éxito, error o advertencia: radio 12 px, texto 14 px, sin borde.
// Pasa role="alert" (errores) o role="status" (éxito) cuando el mensaje aparece tras una acción.
export function Aviso({
  tipo,
  children,
  role,
  id,
}: {
  tipo: keyof typeof ESTILO_AVISO;
  children: ReactNode;
  role?: "alert" | "status";
  id?: string;
}) {
  return (
    <p id={id} role={role} className={`rounded-md px-4 py-3 text-sm ${ESTILO_AVISO[tipo]}`}>
      {children}
    </p>
  );
}

// Error debajo de un campo: 13 px rojo con icono (el error no se explica solo con el color).
export function ErrorDeCampo({
  id,
  children,
  role,
}: {
  id?: string;
  children: ReactNode;
  role?: "alert";
}) {
  return (
    <p id={id} role={role} className="flex items-start gap-1.5 text-[13px] leading-[1.4] text-error">
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="mt-px size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.5v4.25" strokeLinecap="round" />
        <circle cx="8" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

// Porcentaje de afinidad: píldora menta con texto marino (ej. «92 %»).
export function InsigniaAfinidad({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-menta px-3 py-1 text-sm font-bold text-marino">
      {children}
    </span>
  );
}
