// PM-23 · Resumen del perfil de convivencia que se enseña al terminar el test sin cuenta.
// Reglas sencillas sobre las respuestas (1 a 4, de un extremo al otro de las opciones;
// ver migración 0002). Como mucho 3 rasgos: uno de horario, uno de orden y uno de ambiente.
// Frases neutras (no sabemos el género de quien hace el test).

// Número de orden de cada pregunta que usamos (questions.orden, migración 0002).
const ACOSTARSE = 1; // 1 = antes de las 23:00 … 4 = después de la 01:00
const LEVANTARSE = 2; // 1 = antes de las 7:00 … 4 = después de las 9:30
const LIMPIAR_ZONAS_COMUNES = 5; // 1 = nada más usarlas … 4 = cuando se nota
const FREGAR = 6; // 1 = al momento … 4 = cuando se acumula
const VISITAS = 12; // 1 = casi nunca … 4 = muy a menudo
const FIESTAS = 13; // 1 = nunca … 4 = a menudo

export const RASGO_EQUILIBRADO = "Tienes un perfil equilibrado";

// respuestasPorOrden: número de orden de la pregunta → valor elegido (1 a 4).
export function resumenConvivencia(respuestasPorOrden: Record<number, number>): string[] {
  const r = (orden: number) => respuestasPorOrden[orden];
  const rasgos: string[] = [];

  // Horario: levantarse antes de las 8:00 → madrugar; si no, acostarse después de las 00:00 → trasnochar.
  if (r(LEVANTARSE) <= 2) {
    rasgos.push("Te gusta madrugar");
  } else if (r(ACOSTARSE) >= 3) {
    rasgos.push("Eres de trasnochar");
  }

  // Orden: media de limpiar y fregar. Pronto → orden; tarde → con calma.
  const orden = (r(LIMPIAR_ZONAS_COMUNES) + r(FREGAR)) / 2;
  if (orden <= 2) {
    rasgos.push("Eres de orden");
  } else if (orden >= 3.5) {
    rasgos.push("Te tomas la limpieza con calma");
  }

  // Ambiente: pocas visitas y pocas fiestas → tranquilo; muchas de alguna → vida social.
  if (r(VISITAS) <= 2 && r(FIESTAS) <= 2) {
    rasgos.push("Prefieres un piso tranquilo");
  } else if (r(VISITAS) >= 3 || r(FIESTAS) >= 3) {
    rasgos.push("Te gusta tener vida social en casa");
  }

  return rasgos.length > 0 ? rasgos : [RASGO_EQUILIBRADO];
}
