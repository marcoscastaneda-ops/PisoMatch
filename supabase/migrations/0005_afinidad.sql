-- PisoMatch · porcentaje de afinidad (PM-30)
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run,
-- DESPUÉS de 0001 a 0004.
-- Avisar al equipo antes de ejecutarlo: añade funciones a la base de datos.
-- No cambia ninguna tabla ni ninguna política RLS.
--
-- Por qué una función y no una consulta desde la web:
--   RLS hace que cada usuario solo pueda leer SUS respuestas (0001). Para comparar
--   con otra persona hace falta leer las suyas, así que el cálculo se hace aquí,
--   con "security definer" (se ejecuta con permisos del dueño de la base de datos),
--   y solo se devuelve el porcentaje: nunca las respuestas de la otra persona.
--
-- Funciones:
--   test_completo(usuario)       privada: ¿ha respondido las 15 preguntas?
--   afinidad_entre(a, b)         privada: la fórmula. Única copia; las otras la usan.
--   mi_afinidad_con(otro)        para la web: afinidad entre quien llama y otra persona.
--   mis_afinidades()             para la web: afinidad con todos los que completaron el test.
--
-- Fórmula (explicada también en CLAUDE.md):
--   Por cada pregunta:
--     coincidencia según la distancia entre respuestas (1 a 4):
--       0 pasos = 100, 1 paso = 67, 2 pasos = 33, 3 pasos = 0
--     peso = media del peso de cada persona: poco = 1, algo = 2, mucho = 3
--            (importancia vacía = algo)
--   Afinidad = suma(peso × coincidencia) / suma(peso), redondeada a entero.
--   Las imprescindibles NO cuentan aquí: el filtro va en la historia de matches.

begin;

-- ============================================================
-- test_completo: true si el usuario ha respondido todas las preguntas del test
-- ============================================================
create function public.test_completo(usuario uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.questions)
     and (select count(*) from public.answers a where a.user_id = usuario)
       = (select count(*) from public.questions);
$$;

-- ============================================================
-- afinidad_entre: la fórmula. Devuelve 0–100, o null si alguno no completó el test.
-- ============================================================
create function public.afinidad_entre(usuario_a uuid, usuario_b uuid)
returns smallint
language sql
stable
security definer
set search_path = ''
as $$
  select round(sum(t.peso * t.coincidencia) / sum(t.peso))::smallint
  from (
    select
      -- Peso de la pregunta: media de lo que le importa a cada uno.
      ( case coalesce(a.importancia, 'algo') when 'poco' then 1 when 'mucho' then 3 else 2 end
      + case coalesce(b.importancia, 'algo') when 'poco' then 1 when 'mucho' then 3 else 2 end
      ) / 2.0 as peso,
      -- Coincidencia según la distancia entre las dos respuestas.
      case abs(a.respuesta - b.respuesta)
        when 0 then 100
        when 1 then 67
        when 2 then 33
        else 0
      end as coincidencia
    from public.answers a
    join public.answers b
      on b.question_id = a.question_id
     and b.user_id = usuario_b
    where a.user_id = usuario_a
  ) t
  where usuario_a <> usuario_b
    and public.test_completo(usuario_a)
    and public.test_completo(usuario_b);
$$;

-- ============================================================
-- mi_afinidad_con: afinidad entre el usuario con sesión y otra persona.
-- Pensada para cuando se vea el perfil de alguien (y para los matches).
-- Devuelve null si alguno de los dos no ha completado el test, o si es uno mismo.
-- ============================================================
create function public.mi_afinidad_con(otro_usuario uuid)
returns smallint
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Hace falta iniciar sesión' using errcode = '42501';
  end if;
  return public.afinidad_entre(auth.uid(), otro_usuario);
end;
$$;

-- ============================================================
-- mis_afinidades: lista (id de usuario, afinidad) con todas las personas que han
-- completado el test, de mayor a menor afinidad. Vacía si quien llama no lo ha completado.
-- Solo ids y porcentajes: el nombre se lee aparte de profiles.
-- ============================================================
create function public.mis_afinidades()
returns table (usuario_id uuid, afinidad smallint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Hace falta iniciar sesión' using errcode = '42501';
  end if;

  if not public.test_completo(auth.uid()) then
    return;
  end if;

  return query
    select otros.user_id, public.afinidad_entre(auth.uid(), otros.user_id)
    from (
      select a.user_id
      from public.answers a
      where a.user_id <> auth.uid()
      group by a.user_id
      having count(*) = (select count(*) from public.questions)
    ) otros
    order by 2 desc, 1;
end;
$$;

-- ============================================================
-- PERMISOS: por defecto cualquiera podría ejecutar una función. Lo quitamos
-- y solo dejamos las dos de la web a los usuarios con sesión (authenticated).
-- Las privadas solo las usan las otras funciones por dentro.
-- ============================================================
revoke all on function public.test_completo(uuid)        from public, anon, authenticated;
revoke all on function public.afinidad_entre(uuid, uuid) from public, anon, authenticated;
revoke all on function public.mi_afinidad_con(uuid)      from public, anon, authenticated;
revoke all on function public.mis_afinidades()           from public, anon, authenticated;

grant execute on function public.mi_afinidad_con(uuid) to authenticated;
grant execute on function public.mis_afinidades()      to authenticated;

commit;
