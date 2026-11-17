"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { guardarRespuestas } from "@/app/test/actions";
import {
  borrarTestSinCuenta,
  leerTestSinComprobar,
  testComoFormulario,
} from "@/app/test/test-sin-cuenta";
import { Aviso, BOTON_SECUNDARIO } from "@/components/ui";

type Estado = "nada" | "guardando" | "guardado" | "error";

// PM-23 · Si la persona hizo el test sin cuenta en este navegador, al ver su perfil
// (ya creado y con la privacidad aceptada) se guardan esas respuestas en su cuenta.
// Solo lo intenta si la cuenta aún no tiene test (si ya lo tiene, no se toca nada). Usa la misma Server Action que el test
// (guardarRespuestas), con todas sus comprobaciones: sesión, perfil completo, que estén
// todas las preguntas y máximo 3 imprescindibles.
// El localStorage se borra SOLO cuando Supabase confirma que se ha guardado; si falla,
// las respuestas se quedan en el navegador y se puede reintentar.
export function GuardarTestSinCuenta({ cuentaSinTest }: { cuentaSinTest: boolean }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("nada");
  // Evita guardar dos veces si React monta el componente dos veces (modo desarrollo).
  const yaEmpezado = useRef(false);

  const guardar = useCallback(async () => {
    const test = leerTestSinComprobar();
    if (!test) return;
    setEstado("guardando");
    try {
      const resultado = await guardarRespuestas(null, testComoFormulario(test));
      if (resultado && "guardado" in resultado) {
        borrarTestSinCuenta();
        setEstado("guardado");
        // Para que el botón pase a «Repetir el test». Este componente sigue montado,
        // así que el aviso de «guardado» no desaparece.
        router.refresh();
        return;
      }
    } catch {
      // Sin conexión o error del servidor: se trata igual que un error.
    }
    setEstado("error");
  }, [router]);

  useEffect(() => {
    if (!cuentaSinTest || yaEmpezado.current) return;
    yaEmpezado.current = true;
    // Se lanza en segundo plano; el estado cambia cuando responde Supabase.
    void Promise.resolve().then(guardar);
  }, [cuentaSinTest, guardar]);

  if (estado === "guardando") {
    return <Aviso tipo="aviso">Guardando en tu cuenta el test que hiciste antes de registrarte…</Aviso>;
  }
  if (estado === "guardado") {
    return (
      <Aviso tipo="exito" role="status">
        Hemos guardado en tu cuenta el test que hiciste antes de registrarte. No tienes que repetirlo.
      </Aviso>
    );
  }
  if (estado === "error") {
    return (
      <div className="flex flex-col gap-3">
        <Aviso tipo="error" role="alert">
          No se pudo guardar en tu cuenta el test que hiciste antes de registrarte. Tus respuestas
          siguen guardadas en este navegador.
        </Aviso>
        <button type="button" onClick={guardar} className={`${BOTON_SECUNDARIO} sm:self-start`}>
          Intentarlo de nuevo
        </button>
      </div>
    );
  }
  return null;
}
