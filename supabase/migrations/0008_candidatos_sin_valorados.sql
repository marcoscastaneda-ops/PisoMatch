-- PisoMatch · candidatos sin los ya valorados (PM-36)
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run,
-- DESPUÉS de 0007_candidatos.sql y de 0006_intereses.sql (usa la tabla interests).
-- Avisar al equipo antes de ejecutarlo: cambia la función mis_candidatos.
-- No cambia ninguna tabla ni ninguna política RLS.
--
-- Qué cambia respecto a 0007: mis_candidatos es la MISMA función, copiada exacta y con
-- la misma firma (mismos filtros y mismo resultado), con una única regla nueva al final
-- del where:
--   6. No sale nadie a quien yo ya haya valorado («Me interesa» o «Descartar»).
--      Quien me haya valorado a mí sigue saliendo (y yo no sé que lo ha hecho).
-- Las reglas 1 a 5 están explicadas en 0007_candidatos.sql y en CLAUDE.md.

begin;

create or replace function public.mis_candidatos(
  filtro_zona            text    default null,
  filtro_presupuesto_max numeric default null,
  filtro_tipo            text    default 'todos'
)
returns table (usuario_id uuid, afinidad smallint)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  yo       uuid := auth.uid();
  mi_rol   text;
  distrito text := nullif(btrim(filtro_zona), '');
  tipo     text := coalesce(nullif(btrim(filtro_tipo), ''), 'todos');
begin
  if yo is null then
    raise exception 'Hace falta iniciar sesión' using errcode = '42501';
  end if;

  if tipo not in ('todos', 'anfitrion', 'inquilino') then
    raise exception 'Tipo de persona no válido' using errcode = '22023';
  end if;

  -- 1. Quien llama: perfil completo y test terminado. Si no, lista vacía.
  select p.rol into mi_rol
  from public.profiles p
  where p.id = yo
    and p.acepta_privacidad = true
    and p.rol in ('inquilino', 'anfitrion');

  if mi_rol is null or not public.test_completo(yo) then
    return;
  end if;

  return query
    select p.id, public.afinidad_entre(yo, p.id)
    from public.profiles p
    where p.id <> yo
      -- 2. Perfil completo y test terminado.
      and p.acepta_privacidad = true
      and p.rol in ('inquilino', 'anfitrion')
      and public.test_completo(p.id)
      -- 3. Rol (opción B).
      and (mi_rol = 'inquilino' or p.rol = 'inquilino')
      -- 5. Filtros.
      and (tipo = 'todos' or p.rol = tipo)
      and (distrito is null or p.zona = distrito)
      and (
        filtro_presupuesto_max is null
        or p.rol = 'inquilino'
        or (p.presupuesto is not null and p.presupuesto <= filtro_presupuesto_max)
      )
      -- 4. Imprescindibles: ninguna pregunta marcada por alguno de los dos a 2 o más pasos.
      and not exists (
        select 1
        from public.answers mia
        join public.answers suya
          on suya.question_id = mia.question_id
         and suya.user_id = p.id
        where mia.user_id = yo
          and (coalesce(mia.imprescindible, false) or coalesce(suya.imprescindible, false))
          and abs(mia.respuesta - suya.respuesta) >= 2
      )
      -- 6. (PM-36) No sale nadie a quien yo ya haya valorado («Me interesa» o «Descartar»).
      --    Quien me haya valorado a mí sigue saliendo.
      and not exists (
        select 1
        from public.interests i
        where i.de_usuario = yo
          and i.a_usuario = p.id
      )
    order by 2 desc nulls last, 1;
end;
$$;

-- ============================================================
-- PERMISOS: igual que en 0007 (create or replace los conserva; se repiten por claridad).
-- ============================================================
revoke all on function public.mis_candidatos(text, numeric, text) from public, anon, authenticated;
grant execute on function public.mis_candidatos(text, numeric, text) to authenticated;

commit;
