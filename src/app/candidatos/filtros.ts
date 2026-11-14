// Filtros de /candidatos (PM-35). Van en la dirección de la página
// (ej. /candidatos?zona=Retiro&presupuesto=500&tipo=anfitrion), así que cualquiera
// puede escribir lo que quiera: aquí se comprueba todo y lo que no vale se ignora.

import type { Rol } from "@/app/perfil/roles";
import { DISTRITOS_MADRID, PRESUPUESTO_MAX, type Distrito } from "@/app/perfil/datos-perfil";

// Tipo de persona. «todos» o un rol de profiles.rol.
export const TIPOS = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "anfitrion", etiqueta: "Solo con habitación" },
  { valor: "inquilino", etiqueta: "Solo que buscan piso" },
] as const;

export type Tipo = (typeof TIPOS)[number]["valor"];

export type Filtros = {
  zona: Distrito | null;
  presupuestoMax: number | null; // euros al mes; solo se aplica a los anfitriones
  tipo: Tipo;
};

type ParametrosUrl = { [clave: string]: string | string[] | undefined };

// Lee los filtros de la dirección. Un anfitrión solo ve inquilinos, así que para él
// el tipo es siempre «todos» (no se le enseña ese filtro).
export function leerFiltros(parametros: ParametrosUrl, miRol: Rol): Filtros {
  const texto = (clave: string) => {
    const valor = parametros[clave];
    return (Array.isArray(valor) ? valor[0] : valor)?.trim() ?? "";
  };

  const zonaTexto = texto("zona");
  const zona = (DISTRITOS_MADRID as readonly string[]).includes(zonaTexto)
    ? (zonaTexto as Distrito)
    : null;

  const presupuestoTexto = texto("presupuesto");
  const presupuestoMax =
    /^\d+$/.test(presupuestoTexto) && Number(presupuestoTexto) <= PRESUPUESTO_MAX
      ? Number(presupuestoTexto)
      : null;

  const tipoTexto = texto("tipo");
  const tipo =
    miRol === "inquilino" && TIPOS.some((t) => t.valor === tipoTexto)
      ? (tipoTexto as Tipo)
      : "todos";

  return { zona, presupuestoMax, tipo };
}

export function hayFiltros(filtros: Filtros) {
  return filtros.zona !== null || filtros.presupuestoMax !== null || filtros.tipo !== "todos";
}
