"use client";

import Image from "next/image";
import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { cambiarFoto, type EstadoFoto } from "./actions";
import { FOTO_TIPOS, validarFoto } from "./datos-perfil";

// PM-13 · Formulario «Tu foto». Comprueba el archivo en el navegador (JPG/PNG, 5 MB)
// y enseña una vista previa antes de guardarlo. El servidor lo vuelve a comprobar.
export function FormularioFoto({
  fotoUrl,
  nombre,
}: {
  fotoUrl: string | null; // enlace temporal a la foto guardada, o null si no hay
  nombre: string;
}) {
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);

  const [estado, accion, guardando] = useActionState(
    async (anterior: EstadoFoto, formData: FormData) => {
      const resultado = await cambiarFoto(anterior, formData);
      // React vacía el formulario después de enviarlo, así que quitamos también la vista previa.
      setVistaPrevia(null);
      return resultado;
    },
    null,
  );

  // Libera la memoria de la vista previa cuando ya no se usa.
  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0] ?? null;
    const error = archivo ? validarFoto(archivo) : null;
    setErrorArchivo(error);
    if (archivo && !error) {
      setVistaPrevia(URL.createObjectURL(archivo));
    } else {
      setVistaPrevia(null);
      if (error) evento.target.value = ""; // descarta el archivo no válido
    }
  }

  const fotoVisible = vistaPrevia ?? fotoUrl;
  // Con un archivo nuevo elegido, el error del envío anterior ya no aplica.
  const error = errorArchivo ?? (vistaPrevia ? null : estado?.error);

  return (
    <form action={accion} className="flex items-center gap-4">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        {fotoVisible ? (
          <Image
            src={fotoVisible}
            alt={vistaPrevia ? "Vista previa de tu nueva foto" : `Foto de ${nombre}`}
            fill
            unoptimized
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-full items-center justify-center text-3xl font-semibold text-zinc-500"
          >
            {nombre.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {fotoUrl ? "Cambiar foto" : "Añadir foto"}
          <span className="block font-normal text-zinc-500">JPG o PNG, máximo 5 MB.</span>
          <input
            type="file"
            name="foto"
            accept={FOTO_TIPOS.join(",")}
            required
            onChange={alElegir}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "error-foto" : undefined}
            className="mt-2 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-900 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-50"
          />
        </label>

        {error && (
          <p id="error-foto" role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {estado?.guardado && !vistaPrevia && !guardando && !errorArchivo && (
          <p role="status" className="text-sm text-green-700 dark:text-green-400">
            Foto guardada.
          </p>
        )}

        <button
          type="submit"
          disabled={guardando || !vistaPrevia}
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {guardando ? "Subiendo…" : "Guardar foto"}
        </button>
      </div>
    </form>
  );
}
