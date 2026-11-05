// PM-14 · «¿Cuánto te importa?» de cada pregunta del test.
// Lo usan a la vez el navegador (el menú) y el servidor (al guardar), para que
// las reglas sean las mismas en los dos sitios.

// Lo que se guarda en answers.importancia (la migración 0003 solo acepta estos tres,
// en minúsculas). El texto con mayúscula es solo lo que ve el usuario.
export const OPCIONES_IMPORTANCIA = [
  { valor: "poco", texto: "Poco" },
  { valor: "algo", texto: "Algo" },
  { valor: "mucho", texto: "Mucho" },
] as const;

export type Importancia = (typeof OPCIONES_IMPORTANCIA)[number]["valor"];

// Si el usuario no elige nada, se guarda «algo».
export const IMPORTANCIA_POR_DEFECTO: Importancia = "algo";

// Convierte cualquier valor en una importancia válida.
// Vacío (null, como en los tests hechos antes de PM-14) o desconocido → «algo».
// Usarla también al enseñar respuestas ya guardadas (PM-21), para que salga «Algo».
export function normalizarImportancia(valor: unknown): Importancia {
  const opcion = OPCIONES_IMPORTANCIA.find((o) => o.valor === valor);
  return opcion ? opcion.valor : IMPORTANCIA_POR_DEFECTO;
}
