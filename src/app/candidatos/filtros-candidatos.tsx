import Form from "next/form";
import Link from "next/link";
import type { Rol } from "@/app/perfil/roles";
import { DISTRITOS_MADRID, PRESUPUESTO_MAX } from "@/app/perfil/datos-perfil";
import { TIPOS, hayFiltros, type Filtros } from "./filtros";
import {
  BOTON_PRINCIPAL,
  CAMPO,
  ENLACE,
  ETIQUETA,
  GRUPO_CAMPO,
  TARJETA,
  TARJETA_OPCION,
  TEXTO_SUAVE,
} from "@/components/ui";

// Formulario de filtros. Es un formulario GET: al aplicar, los filtros pasan a la
// dirección (/candidatos?zona=…) y la página vuelve a pedir la lista con ellos.
export function FiltrosCandidatos({ filtros, miRol }: { filtros: Filtros; miRol: Rol }) {
  // La «key» hace que el formulario se rellene de nuevo con los filtros de la dirección
  // (por ejemplo, al pulsar «Quitar filtros»).
  const clave = `${filtros.zona}-${filtros.presupuestoMax}-${filtros.tipo}`;

  return (
    <Form
      key={clave}
      action="/candidatos"
      className={`${TARJETA} flex flex-col gap-4`}
      aria-label="Filtros"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={GRUPO_CAMPO}>
          <label htmlFor="filtro-zona" className={ETIQUETA}>
            Distrito
          </label>
          <select
            id="filtro-zona"
            name="zona"
            defaultValue={filtros.zona ?? ""}
            className={CAMPO}
          >
            <option value="">Cualquiera</option>
            {DISTRITOS_MADRID.map((distrito) => (
              <option key={distrito} value={distrito}>
                {distrito}
              </option>
            ))}
          </select>
        </div>

        <div className={GRUPO_CAMPO}>
          <label htmlFor="filtro-presupuesto" className={ETIQUETA}>
            Presupuesto máximo (€ al mes)
          </label>
          <input
            id="filtro-presupuesto"
            name="presupuesto"
            type="number"
            inputMode="numeric"
            min={0}
            max={PRESUPUESTO_MAX}
            step={1}
            placeholder="Sin límite"
            defaultValue={filtros.presupuestoMax ?? ""}
            aria-describedby="ayuda-presupuesto"
            className={CAMPO}
          />
          <p id="ayuda-presupuesto" className={TEXTO_SUAVE}>
            {miRol === "inquilino"
              ? "Se compara con el precio de las habitaciones."
              : "Los inquilinos no se filtran por presupuesto."}
          </p>
        </div>
      </div>

      {/* Un anfitrión solo ve inquilinos: este filtro no le cambiaría nada. */}
      {miRol === "inquilino" ? (
        <fieldset className="flex flex-col gap-3">
          <legend className={`${ETIQUETA} mb-1.5`}>Tipo de persona</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {TIPOS.map((tipo) => (
              <label key={tipo.valor} className={TARJETA_OPCION}>
                <input
                  type="radio"
                  name="tipo"
                  value={tipo.valor}
                  defaultChecked={tipo.valor === filtros.tipo}
                  className="opcion"
                />
                <span className="font-semibold">{tipo.etiqueta}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <button type="submit" className={`${BOTON_PRINCIPAL} sm:w-auto`}>
          Aplicar filtros
        </button>
        {hayFiltros(filtros) ? (
          <Link href="/candidatos" className={`${ENLACE} self-start sm:self-center`}>
            Quitar filtros
          </Link>
        ) : null}
      </div>
    </Form>
  );
}
