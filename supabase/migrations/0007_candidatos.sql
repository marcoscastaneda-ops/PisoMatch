-- PisoMatch · lista de candidatos compatibles (PM-35)
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run,
-- DESPUÉS de 0005_afinidad.sql (usa sus funciones test_completo y afinidad_entre).
-- No depende de 0006 (PM-36).
-- Avisar al equipo antes de ejecutarlo: añade una función a la base de datos.
-- No cambia ninguna tabla, ninguna política RLS ni las funciones de 0005.
--
-- Por qué una función y no una consulta desde la web:
--   Para quitar a quien incumple las imprescindibles hay que comparar las respuestas
--   de las dos personas, y RLS solo deja leer las propias (0001). Igual que en 0005,
--   se hace aquí con "security definer" y solo se devuelven ids y porcentajes:
--   nunca respuestas, ni qué pregunta ha hecho que alguien no salga.
--
-- mis_candidatos(filtro_zona, filtro_presupuesto_max, filtro_tipo)
--   Devuelve (usuario_id, afinidad), de mayor a menor afinidad. Reglas (también en CLAUDE.md):
--   1. Quien llama debe tener perfil completo (rol válido y privacidad aceptada) y el test
--      terminado; si no, la lista sale vacía. Nunca sale uno mismo.
--   2. Solo salen personas con perfil completo y test terminado.
--   3. Rol (opción B): un inquilino ve anfitriones e inquilinos (para alquilar juntos);
--      un anfitrión solo ve inquilinos.
--   4. Imprescindibles: cuentan las marcadas por CUALQUIERA de los dos (vacía = no marcada).
--      Si en alguna las respuestas están a 2 o más pasos, esa persona no sale.
--   5. Filtros opcionales (vacío = sin filtro):
--      - filtro_zona: distrito exacto. Sin zona en el perfil → no sale si se filtra.
--      - filtro_presupuesto_max: solo se aplica a los ANFITRIONES (presupuesto del perfil
--        hasta que exista PM-15). Anfitrión sin presupuesto → no sale si se filtra.
--        Los inquilinos no se filtran por presupuesto.
--      - filtro_tipo: 'todos', 'anfitrion' o 'inquilino'.
--   La afinidad es la de 0005 (afinidad_entre): la fórmula no se copia.

begin;

create function public.mis_candidatos(
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
    order by 2 desc nulls last, 1;
end;
$$;

-- ============================================================
-- PERMISOS: solo los usuarios con sesión pueden ejecutarla.
-- ============================================================
revoke all on function public.mis_candidatos(text, numeric, text) from public, anon, authenticated;
grant execute on function public.mis_candidatos(text, numeric, text) to authenticated;

commit;
