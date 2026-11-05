import { ROLES, type Rol } from "./roles";
import { ETIQUETA, TARJETA_OPCION } from "@/components/ui";

// Las dos tarjetas para elegir rol. Se usan en la bienvenida y en el perfil.
export function OpcionesRol({ rolActual }: { rolActual?: Rol }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={`${ETIQUETA} mb-1.5`}>¿Qué buscas en PisoMatch?</legend>
      {ROLES.map((rol) => (
        <label key={rol.valor} className={TARJETA_OPCION}>
          <input
            type="radio"
            name="rol"
            value={rol.valor}
            defaultChecked={rol.valor === rolActual}
            required
            className="opcion"
          />
          <span>
            <span className="block font-semibold">{rol.etiqueta}</span>
            <span className="block text-sm leading-[1.4] text-texto-suave">{rol.descripcion}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
