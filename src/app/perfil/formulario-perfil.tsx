"use client";

import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { guardarPerfil, type EstadoPerfil } from "./actions";
import { CampoFoto } from "./campo-foto";
import { OpcionesRol } from "./opciones-rol";
import type { Rol } from "./roles";
import {
  DESCRIPCION_MAX,
  DISTRITOS_MADRID,
  NOMBRE_MAX,
  PRESUPUESTO_MAX,
  hoyEnMadrid,
  leerValoresDatos,
  validarDatosPerfil,
  type CampoDatos,
  type ErroresDatos,
  type ValoresDatos,
} from "./datos-perfil";
import {
  AREA_TEXTO,
  Aviso,
  BOTON_PRINCIPAL,
  CAMPO,
  ErrorDeCampo,
  ETIQUETA,
  GRUPO_CAMPO,
  SUBTITULO,
  TEXTO_SUAVE,
} from "@/components/ui";


// Formulario del perfil: «Tu rol» y «Tus datos» (foto incluida), con un solo botón
// «Guardar cambios» que lo guarda todo a la vez (acción guardarPerfil).
// Comprueba los campos en el navegador antes de enviar y muestra cada aviso junto a su campo.
export function FormularioPerfil({
  valoresIniciales,
  fotoUrl,
}: {
  valoresIniciales: ValoresDatos & { rol: Rol };
  fotoUrl: string | null;
}) {
  // Cambia después de guardar bien, para vaciar el campo de la foto y su vista previa.
  const [versionFoto, setVersionFoto] = useState(0);

  const [estado, accion, guardando] = useActionState(
    async (anterior: EstadoPerfil, formData: FormData) => {
      const resultado = await guardarPerfil(anterior, formData);
      if (resultado?.guardado) setVersionFoto((v) => v + 1);
      return resultado;
    },
    null,
  );
  const [erroresNavegador, setErroresNavegador] = useState<ErroresDatos | null>(null);

  const errores = erroresNavegador ?? estado?.errores ?? {};
  const hayErroresEnCampos = Object.keys(errores).length > 0 || !!estado?.errorFoto;

  const [largoDescripcion, setLargoDescripcion] = useState(
    valoresIniciales.descripcion.length,
  );

  // Enviamos «a mano» (y no con <form action>) para que React no vacíe el formulario:
  // así, si algo falla, todo lo que ha escrito el usuario sigue en pantalla.
  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const formData = new FormData(formulario);

    const { errores } = validarDatosPerfil(leerValoresDatos(formData));
    if (errores) {
      setErroresNavegador(errores);
      // Lleva al usuario al primer campo con error.
      const primero = Object.keys(errores)[0];
      formulario.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
      return;
    }

    setErroresNavegador(null);
    startTransition(() => accion(formData));
  }

  // Props comunes para marcar un campo con error y enlazarlo con su aviso.
  const propsDeError = (campo: CampoDatos) => ({
    id: `campo-${campo}`,
    "aria-invalid": errores[campo] ? true : undefined,
    "aria-describedby": errores[campo] ? `error-${campo}` : undefined,
  });

  return (
    <form onSubmit={alEnviar} noValidate className="flex flex-col gap-8 md:gap-12">
      <section className="flex flex-col gap-3">
        <h2 className={SUBTITULO}>Tu rol</h2>
        <OpcionesRol rolActual={valoresIniciales.rol} />
        {errores.rol && (
          <ErrorDeCampo id="error-rol">{errores.rol}</ErrorDeCampo>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className={SUBTITULO}>Tus datos</h2>
          <p className={`mt-1 ${TEXTO_SUAVE}`}>
            Así te verán los demás. El presupuesto y la zona sirven para encontrar tus matches.
          </p>
        </div>

        <CampoFoto
          key={versionFoto}
          fotoUrl={fotoUrl}
          nombre={valoresIniciales.nombre}
          errorServidor={estado?.errorFoto}
        />

        <div className="flex flex-col gap-4">
          <Campo campo="nombre" etiqueta="Nombre" error={errores.nombre}>
            <input
              {...propsDeError("nombre")}
              type="text"
              name="nombre"
              required
              maxLength={NOMBRE_MAX}
              autoComplete="given-name"
              defaultValue={valoresIniciales.nombre}
              className={CAMPO}
            />
          </Campo>

          <Campo
            campo="descripcion"
            etiqueta="Sobre ti"
            opcional
            ayuda={`${largoDescripcion}/${DESCRIPCION_MAX} caracteres`}
            error={errores.descripcion}
          >
            <textarea
              {...propsDeError("descripcion")}
              name="descripcion"
              rows={4}
              maxLength={DESCRIPCION_MAX}
              defaultValue={valoresIniciales.descripcion}
              onChange={(e) => setLargoDescripcion(e.target.value.length)}
              placeholder="Qué estudias o a qué te dedicas, tus aficiones, cómo eres en casa…"
              className={AREA_TEXTO}
            />
          </Campo>

          <Campo campo="presupuesto" etiqueta="Presupuesto (€ al mes)" error={errores.presupuesto}>
            <input
              {...propsDeError("presupuesto")}
              type="number"
              name="presupuesto"
              required
              min={0}
              max={PRESUPUESTO_MAX}
              step={1}
              inputMode="numeric"
              defaultValue={valoresIniciales.presupuesto}
              placeholder="Por ejemplo, 450"
              className={CAMPO}
            />
          </Campo>

          <Campo campo="zona" etiqueta="Zona (distrito de Madrid)" error={errores.zona}>
            <select
              {...propsDeError("zona")}
              name="zona"
              required
              defaultValue={valoresIniciales.zona}
              className={CAMPO}
            >
              <option value="">Elige un distrito…</option>
              {DISTRITOS_MADRID.map((distrito) => (
                <option key={distrito} value={distrito}>
                  {distrito}
                </option>
              ))}
            </select>
          </Campo>

          <Campo
            campo="fecha_entrada"
            etiqueta="Fecha de entrada"
            opcional
            error={errores.fecha_entrada}
          >
            {/* `min` impide elegir en el calendario un día anterior a hoy. Si se escribe a mano,
                validarDatosPerfil lo comprueba (aquí y en el servidor). */}
            <input
              {...propsDeError("fecha_entrada")}
              type="date"
              name="fecha_entrada"
              min={hoyEnMadrid()}
              defaultValue={valoresIniciales.fecha_entrada}
              className={CAMPO}
            />
          </Campo>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        {estado?.error && (
          <Aviso tipo="error" role="alert">
            {estado.error}
          </Aviso>
        )}
        {hayErroresEnCampos && !guardando && (
          <Aviso tipo="error" role="alert">
            No se ha guardado nada: revisa los avisos en rojo de arriba.
          </Aviso>
        )}
        {/* No decir «guardados» si el navegador acaba de frenar un envío con errores. */}
        {estado?.guardado && !guardando && !erroresNavegador && (
          <Aviso tipo="exito" role="status">
            Cambios guardados.
          </Aviso>
        )}

        <button
          type="submit"
          disabled={guardando}
          className={BOTON_PRINCIPAL}
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

// Etiqueta + campo + aviso de error (o texto de ayuda) debajo.
function Campo({
  campo,
  etiqueta,
  opcional = false,
  ayuda,
  error,
  children,
}: {
  campo: CampoDatos;
  etiqueta: string;
  opcional?: boolean;
  ayuda?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={GRUPO_CAMPO}>
      <label
        htmlFor={`campo-${campo}`}
        className={ETIQUETA}
      >
        {etiqueta}
        {opcional && <span className="font-normal text-texto-suave"> (opcional)</span>}
      </label>
      {children}
      {error ? (
        <ErrorDeCampo id={`error-${campo}`}>{error}</ErrorDeCampo>
      ) : (
        ayuda && <p className={TEXTO_SUAVE}>{ayuda}</p>
      )}
    </div>
  );
}
