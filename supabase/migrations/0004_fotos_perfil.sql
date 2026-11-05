-- PisoMatch · fotos de perfil (PM-13)
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run.
-- Avisar al equipo antes de ejecutarlo: crea un bucket de Storage y sus políticas.
-- No cambia ninguna tabla de la app (profiles ya tenía la columna foto_url).
--
-- Cómo se guardan las fotos:
--   Cada foto va en el bucket privado "fotos-perfil", dentro de una carpeta con el id del usuario:
--     fotos-perfil/<id del usuario>/<fecha-hora>.jpg
--   En profiles.foto_url se guarda esa ruta (<id>/<fecha-hora>.jpg), NO un enlace.
--   Para enseñarla, la web pide a Supabase un enlace temporal (createSignedUrl).

begin;

-- ============================================================
-- BUCKET: privado, solo JPG/PNG, máximo 5 MB por archivo
-- (Supabase rechaza por su cuenta cualquier archivo que no cumpla esto)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-perfil',
  'fotos-perfil',
  false,                               -- privado: no se puede ver sin sesión
  5242880,                             -- 5 MB (5 × 1024 × 1024 bytes)
  array['image/jpeg', 'image/png']
);

-- ============================================================
-- POLÍTICAS (RLS) sobre los archivos del bucket
-- (storage.foldername(name))[1] es la primera carpeta de la ruta, es decir, el id del dueño.
-- ============================================================

-- Ver: cualquier usuario con sesión puede ver las fotos de perfil (para conocer a sus matches).
create policy "Fotos de perfil visibles para usuarios con sesión"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'fotos-perfil');

-- Subir: solo dentro de tu propia carpeta.
create policy "Cada usuario sube su foto"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'fotos-perfil'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Cambiar: solo archivos de tu carpeta, y sin poder moverlos a la carpeta de otro.
create policy "Cada usuario cambia su foto"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'fotos-perfil'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'fotos-perfil'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Borrar: solo archivos de tu carpeta.
create policy "Cada usuario borra su foto"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'fotos-perfil'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
