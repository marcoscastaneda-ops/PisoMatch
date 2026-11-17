// PM-23 · Test sin cuenta: las respuestas se guardan en el localStorage del navegador
// (nunca en Supabase) hasta que la persona se registra y completa la bienvenida de /perfil.
// Solo se usa en el navegador (componentes "use client").
import type { Pregunta } from "./datos";
import { normalizarImportancia, type Importancia } from "./importancia";
import { VALOR_IMPRESCINDIBLE, dentroDelLimite } from "./imprescindibles";

// Nombre con el que se guarda en el localStorage. Si algún día cambia el formato, cambiar la versión.
const CLAVE = "pisomatch-test-sin-cuenta-v1";
// Aviso interno para que la página se entere cuando guardamos o borramos (en la misma pestaña).
const EVENTO = "pisomatch-test-sin-cuenta";

export type RespuestaSinCuenta = {
  respuesta: number; // 1 a 4, como answers.respuesta
  importancia: Importancia;
  imprescindible: boolean;
};

// id de la pregunta → su respuesta.
export type TestSinCuenta = Record<number, RespuestaSinCuenta>;

// --- Leer, guardar y borrar ---------------------------------------------------
// El localStorage puede fallar (modo privado, almacenamiento lleno o bloqueado):
// por eso todo va en try/catch y, si falla, se comporta como si no hubiera nada.

export function guardarTestSinCuenta(test: TestSinCuenta): boolean {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(test));
    window.dispatchEvent(new Event(EVENTO));
    return true;
  } catch {
    return false;
  }
}

export function borrarTestSinCuenta() {
  try {
    window.localStorage.removeItem(CLAVE);
    window.dispatchEvent(new Event(EVENTO));
  } catch {
    // Nada que hacer: si no se puede borrar, tampoco se podía leer.
  }
}

// Texto tal cual está guardado (o null). Para useSyncExternalStore: devuelve siempre
// el mismo texto mientras no cambie, así React no repinta sin motivo.
export function leerTextoGuardado(): string | null {
  try {
    return window.localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

// Avisa a React cuando cambia lo guardado: en esta pestaña (EVENTO) o en otra ("storage").
export function suscribirseAlTestSinCuenta(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

// Convierte el texto guardado en un test, solo si responde TODAS las preguntas actuales
// con valores válidos. Si falta algo (o alguien lo ha tocado a mano), devuelve null.
export function interpretarTestGuardado(
  texto: string | null,
  preguntas: { id: number; opciones: unknown[] }[],
): TestSinCuenta | null {
  if (!texto) return null;
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return null;
  }
  if (typeof datos !== "object" || datos === null) return null;

  const test: TestSinCuenta = {};
  for (const pregunta of preguntas) {
    const fila = (datos as Record<string, unknown>)[pregunta.id];
    if (typeof fila !== "object" || fila === null) return null;
    const { respuesta, importancia, imprescindible } = fila as Record<string, unknown>;
    if (
      typeof respuesta !== "number" ||
      !Number.isInteger(respuesta) ||
      respuesta < 1 ||
      respuesta > pregunta.opciones.length
    ) {
      return null;
    }
    test[pregunta.id] = {
      respuesta,
      importancia: normalizarImportancia(importancia),
      imprescindible: imprescindible === true,
    };
  }

  const marcadas = Object.values(test).filter((r) => r.imprescindible).length;
  return dentroDelLimite(marcadas) ? test : null;
}

// Lo que leemos del localStorage sin conocer las preguntas (en /perfil, para pasarlo
// a la cuenta). Aquí no se comprueba nada: lo comprueba el servidor al guardar.
export function leerTestSinComprobar(): Record<string, Partial<RespuestaSinCuenta>> | null {
  const texto = leerTextoGuardado();
  if (!texto) return null;
  try {
    const datos: unknown = JSON.parse(texto);
    return typeof datos === "object" && datos !== null
      ? (datos as Record<string, Partial<RespuestaSinCuenta>>)
      : null;
  } catch {
    return null;
  }
}

// Prepara el test con los mismos nombres de campo que envía el cuestionario
// («respuesta-<id>», «importancia-<id>», «imprescindible-<id>»), para guardarlo
// con la misma Server Action del test (guardarRespuestas) y sus mismas comprobaciones.
export function testComoFormulario(test: Record<string, Partial<RespuestaSinCuenta>>): FormData {
  const formulario = new FormData();
  for (const [id, fila] of Object.entries(test)) {
    formulario.set(`respuesta-${id}`, String(fila?.respuesta ?? ""));
    formulario.set(`importancia-${id}`, normalizarImportancia(fila?.importancia));
    if (fila?.imprescindible === true) {
      formulario.set(`imprescindible-${id}`, VALOR_IMPRESCINDIBLE);
    }
  }
  return formulario;
}

// Junta lo elegido en el cuestionario en un solo objeto para guardarlo.
export function crearTestSinCuenta(
  preguntas: Pregunta[],
  respuestas: Record<number, number>,
  importanciaDe: (id: number) => Importancia,
  imprescindibles: number[],
): TestSinCuenta {
  const test: TestSinCuenta = {};
  for (const pregunta of preguntas) {
    test[pregunta.id] = {
      respuesta: respuestas[pregunta.id],
      importancia: importanciaDe(pregunta.id),
      imprescindible: imprescindibles.includes(pregunta.id),
    };
  }
  return test;
}
