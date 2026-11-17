-- PisoMatch · correo de contacto de mis matches (PM-39)
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run,
-- DESPUÉS de 0006_intereses.sql (usa la función mis_matches).
-- Avisar al equipo antes de ejecutarlo: añade una función a la base de datos.
-- No crea ni cambia ninguna tabla ni ninguna política RLS.
--
-- Por qué una función y no una consulta desde la web:
--   El correo con el que cada persona se registró está en auth.users, que la web no
--   puede (ni debe) leer. Esta función lo lee con "security definer" (permisos del
--   dueño de la base de datos) y solo entrega el correo de las personas con las que
--   quien llama tiene MATCH MUTUO (los dos «Me interesa»). De nadie más.
--
-- Quién cuenta como match lo decide mis_matches (0006): aquí no se copia esa regla,
-- así que si algún día cambia, esta función la sigue sin tocarla.
--
-- Función para la web (solo usuarios con sesión):
--   correos_de_mis_matches()   (usuario_id, correo) de cada uno de mis matches.

begin;

-- ============================================================
-- correos_de_mis_matches: el correo de registro de cada match mutuo de quien llama.
-- Sin matches → lista vacía. Sin sesión → error.
-- ============================================================
create function public.correos_de_mis_matches()
returns table (usuario_id uuid, correo text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Hace falta iniciar sesión' using errcode = '42501';
  end if;

  return query
    select m.usuario_id, u.email::text
    from public.mis_matches() m
    join auth.users u on u.id = m.usuario_id;
end;
$$;

-- ============================================================
-- PERMISOS: solo los usuarios con sesión pueden ejecutarla.
-- ============================================================
revoke all on function public.correos_de_mis_matches() from public, anon, authenticated;
grant execute on function public.correos_de_mis_matches() to authenticated;

commit;
