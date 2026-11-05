"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent } from "react";
import { FOTO_TIPOS, validarFoto } from "./datos-perfil";
import { ErrorDeCampo, ETIQUETA, TEXTO_SUAVE } from "@/components/ui";

// PM-13 · Campo «Tu foto», dentro del formulario del perfil (se guarda con «Guardar cambios»).
// Comprueba el archivo en el navegador (JPG/PNG, 5 MB) y enseña una vista previa.
// El servidor lo vuelve a comprobar.
export function CampoFoto({
  fotoUrl,
  nombre,
  errorServidor,
}: {
  fotoUrl: string | null; // enlace temporal a la foto guardada, o null si no hay
  nombre: string;
  errorServidor?: string; // error de la foto al guardar, si lo hubo
}) {
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);

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
  const error = errorArchivo ?? errorServidor;

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-melocoton">
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
            className="flex size-full items-center justify-center text-3xl font-bold text-marino"
          >
            {nombre.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <label className={ETIQUETA}>
          {fotoUrl ? "Cambiar foto" : "Añadir foto"}
          <span className="font-normal text-texto-suave"> (opcional)</span>
          <span className={`block font-normal ${TEXTO_SUAVE}`}>JPG o PNG, máximo 5 MB.</span>
          <input
            type="file"
            name="foto"
            accept={FOTO_TIPOS.join(",")}
            onChange={alElegir}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "error-foto" : undefined}
            className="mt-2 block w-full rounded-full text-sm font-normal text-texto-suave file:mr-3 file:min-h-12 file:cursor-pointer file:rounded-full file:border-2 file:border-solid file:border-marino file:bg-white file:px-5 file:text-base file:font-semibold file:text-marino hover:file:bg-crema focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-menta focus-visible:ring-offset-2"
          />
        </label>

        {error && (
          <ErrorDeCampo id="error-foto" role="alert">
            {error}
          </ErrorDeCampo>
        )}
        {vistaPrevia && !error && (
          <p className={TEXTO_SUAVE}>
            La foto nueva se guardará al pulsar «Guardar cambios».
          </p>
        )}
      </div>
    </div>
  );
}
