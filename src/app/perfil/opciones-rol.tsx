import { ROLES, type Rol } from "./roles";

// Las dos tarjetas para elegir rol. Se usan en la bienvenida y en el perfil.
export function OpcionesRol({ rolActual }: { rolActual?: Rol }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        ¿Qué buscas en PisoMatch?
      </legend>
      {ROLES.map((rol) => (
        <label
          key={rol.valor}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 has-[:checked]:border-zinc-900 has-[:checked]:ring-1 has-[:checked]:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:ring-zinc-100"
        >
          <input
            type="radio"
            name="rol"
            value={rol.valor}
            defaultChecked={rol.valor === rolActual}
            required
            className="mt-1"
          />
          <span>
            <span className="block font-medium text-zinc-900 dark:text-zinc-50">
              {rol.etiqueta}
            </span>
            <span className="block text-sm text-zinc-600 dark:text-zinc-400">
              {rol.descripcion}
            </span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
