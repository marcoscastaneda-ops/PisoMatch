// PM-16 · «Es imprescindible para mí» de cada pregunta del test.
// Lo usan a la vez el navegador (la casilla y el contador) y el servidor (al guardar),
// para que las reglas sean las mismas en los dos sitios.

// Cuántas preguntas se pueden marcar como imprescindibles en todo el test.
export const MAX_IMPRESCINDIBLES = 3;

// Valor que envía la casilla cuando está marcada (campo "imprescindible-<id>").
export const VALOR_IMPRESCINDIBLE = "si";

// Convierte lo que llega del formulario en true/false: solo cuenta como marcada
// si llega exactamente VALOR_IMPRESCINDIBLE; cualquier otra cosa (o nada) es false.
export function leerImprescindible(valor: unknown): boolean {
  return valor === VALOR_IMPRESCINDIBLE;
}

// ¿Se pueden guardar estas marcas? (0, 1, 2 o 3).
export function dentroDelLimite(cuantas: number): boolean {
  return cuantas <= MAX_IMPRESCINDIBLES;
}

// Mensaje cuando se llega al límite o alguien intenta pasarse.
export const AVISO_LIMITE_IMPRESCINDIBLES = `Ya tienes ${MAX_IMPRESCINDIBLES} imprescindibles. Desmarca alguna si quieres elegir esta.`;
export const ERROR_LIMITE_IMPRESCINDIBLES = `Solo puedes marcar hasta ${MAX_IMPRESCINDIBLES} preguntas como imprescindibles.`;
