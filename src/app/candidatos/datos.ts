import type { createClient } from "@/lib/supabase/server";
import { esRolValido } from "@/app/perfil/roles";
import { BUCKET_FOTOS } from "@/app/perfil/datos-perfil";
import type { Candidato } from "./tarjeta-candidato";

type ClienteSupabase = Awaited<ReturnType<typeof createClient>>;

// Duración del enlace temporal a cada foto privada, en segundos (igual que en /perfil).
const DURACION_ENLACE_FOTO = 60 * 60;

// Datos de cada persona (profiles es visible para usuarios con sesión) y enlaces
// temporales a sus fotos, todos de una vez. Lo usan /candidatos (PM-35) y /matches (PM-36).
// Mantiene el orden de las filas que llegan. Devuelve null si algo falla.
export async function cargarCandidatos(
  supabase: ClienteSupabase,
  filas: { usuario_id: string; afinidad: number | null }[],
): Promise<Candidato[] | null> {
  const ids = filas.map((fila) => fila.usuario_id);
  if (ids.length === 0) return [];

  const { data: perfiles, error } = await supabase
    .from("profiles")
    .select("id, nombre, rol, zona, presupuesto, foto_url")
    .in("id", ids);
  if (error || !perfiles) return null;

  // Si fallan los enlaces de las fotos, se enseña la inicial y ya está.
  const rutasFotos = perfiles.map((perfil) => perfil.foto_url).filter((ruta): ruta is string => !!ruta);
  const enlaces = new Map<string, string>();
  if (rutasFotos.length > 0) {
    const { data: firmadas } = await supabase.storage
      .from(BUCKET_FOTOS)
      .createSignedUrls(rutasFotos, DURACION_ENLACE_FOTO);
    firmadas?.forEach((firmada) => {
      if (firmada.path && firmada.signedUrl) enlaces.set(firmada.path, firmada.signedUrl);
    });
  }

  const porId = new Map(perfiles.map((perfil) => [perfil.id, perfil]));

  // Se mantiene el orden de la base de datos.
  return filas.flatMap((fila) => {
    const perfil = porId.get(fila.usuario_id);
    if (!perfil || fila.afinidad === null || !esRolValido(perfil.rol)) return [];
    return [
      {
        id: perfil.id,
        nombre: perfil.nombre,
        rol: perfil.rol,
        zona: perfil.zona || null,
        presupuesto: perfil.presupuesto == null ? null : Number(perfil.presupuesto),
        fotoUrl: perfil.foto_url ? (enlaces.get(perfil.foto_url) ?? null) : null,
        afinidad: fila.afinidad,
      },
    ];
  });
}
