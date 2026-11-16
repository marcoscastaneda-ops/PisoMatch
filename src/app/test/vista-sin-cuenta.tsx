"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Pregunta } from "./datos";
import { CuestionarioTest } from "./cuestionario-test";
import { resumenConvivencia } from "./resumen-convivencia";
import {
  guardarTestSinCuenta,
  interpretarTestGuardado,
  leerTextoGuardado,
  suscribirseAlTestSinCuenta,
  type TestSinCuenta,
} from "./test-sin-cuenta";
import {
  Aviso,
  BOTON_PRINCIPAL,
  BOTON_SECUNDARIO,
  ENLACE,
  ENLACE_EN_TEXTO,
  SUBTITULO,
  TARJETA,
  TEXTO_SUAVE,
} from "@/components/ui";

// PM-23 · /test sin sesión. Si en este navegador ya hay un test terminado, se enseña
// el resumen; si no, el cuestionario. Nada de esto se envía a Supabase.
export function VistaSinCuenta({ preguntas }: { preguntas: Pregunta[] }) {
  // Lo guardado en el localStorage (en el servidor no existe: allí siempre null).
  const texto = useSyncExternalStore(suscribirseAlTestSinCuenta, leerTextoGuardado, () => null);
  const test = interpretarTestGuardado(texto, preguntas);
  const [repitiendo, setRepitiendo] = useState(false);
  const [errorAlGuardar, setErrorAlGuardar] = useState(false);

  function alFinalizar(nuevo: TestSinCuenta) {
    if (guardarTestSinCuenta(nuevo)) {
      setErrorAlGuardar(false);
      setRepitiendo(false);
    } else {
      setErrorAlGuardar(true);
    }
  }

  if (test && !repitiendo) {
    return <ResumenSinCuenta preguntas={preguntas} test={test} onRepetir={() => setRepitiendo(true)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {errorAlGuardar && (
        <Aviso tipo="error" role="alert">
          Tu navegador no deja guardar las respuestas (puede pasar en modo privado o con el
          almacenamiento bloqueado). Prueba en otra ventana o crea una cuenta para hacer el test.
        </Aviso>
      )}
      {!repitiendo && (
        <p className="text-texto-suave">
          Sin crear cuenta: tus respuestas se quedan solo en este navegador.
        </p>
      )}
      <CuestionarioTest preguntas={preguntas} alFinalizarSinCuenta={alFinalizar} />
    </div>
  );
}

function ResumenSinCuenta({
  preguntas,
  test,
  onRepetir,
}: {
  preguntas: Pregunta[];
  test: TestSinCuenta;
  onRepetir: () => void;
}) {
  // El resumen trabaja con el número de orden de cada pregunta (1 a 15), no con su id.
  const porOrden: Record<number, number> = {};
  for (const pregunta of preguntas) {
    porOrden[pregunta.orden] = test[pregunta.id].respuesta;
  }
  const rasgos = resumenConvivencia(porOrden);

  return (
    <div role="status" className="flex flex-col gap-6">
      <section className={`${TARJETA} flex flex-col gap-4`}>
        <h2 className={SUBTITULO}>Tu perfil de convivencia</h2>
        <ul className="flex flex-col gap-2">
          {rasgos.map((rasgo) => (
            <li key={rasgo} className="rounded-md bg-menta px-4 py-3 font-semibold text-marino">
              {rasgo}
            </li>
          ))}
        </ul>
        <p className="text-texto-suave">
          Crea tu cuenta y guardaremos estas respuestas: no tendrás que repetir el test.
        </p>
        <Link href="/registro" className={`${BOTON_PRINCIPAL} mt-1`}>
          Regístrate para ver con quién encajas
        </Link>
        <p className={TEXTO_SUAVE}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className={ENLACE_EN_TEXTO}>
            Inicia sesión
          </Link>
        </p>
      </section>

      <button type="button" onClick={onRepetir} className={`${BOTON_SECUNDARIO} sm:self-start`}>
        Repetir el test
      </button>
      <Link href="/" className={`${ENLACE} self-start`}>
        Volver al inicio
      </Link>
    </div>
  );
}
