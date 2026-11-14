-- PisoMatch · mostrar interés y hacer match (PM-36)
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run,
-- DESPUÉS de 0005_afinidad.sql (usa afinidad_entre) y ANTES de 0008.
-- Avisar al equipo antes de ejecutarlo: crea una tabla nueva y dos funciones.
-- No cambia ninguna tabla ni política que ya exista.
--
-- interests: lo que cada persona ha decidido sobre otra («Me interesa» o «Descartar»).
--   - Un único registro por pareja (de_usuario, a_usuario).
--   - Decisión del PO en el MVP: no se puede cambiar de opinión ni deshacer un match,
--     así que no hay políticas de UPDATE ni DELETE.
--   - RLS: cada uno solo ve y crea SUS filas. Nadie puede saber quién le ha valorado.
--
-- El match NO se guarda en ninguna tabla: hay match cuando existen las dos filas
-- cruzadas con 'interesa'. Así nunca se desincroniza.
--
-- Funciones para la web (solo usuarios con sesión):
--   valorar(otro_usuario, decision)  guarda mi decisión y devuelve true si hay match.
--   mis_matches()                    (usuario_id, afinidad, fecha) de mis matches.
-- Son "security definer" porque necesitan mirar la fila del otro (si le intereso),
-- que RLS no me deja leer. Solo devuelven sí/no, ids y porcentajes.

begin;

-- ============================================================
-- TABLA interests
-- ============================================================
create table public.interests (
  de_usuario uuid not null references public.profiles (id) on delete cascade,
  a_usuario  uuid not null references public.profiles (id) on delete cascade,
  decision   text not null check (decision in ('interesa', 'descarta')),
  created_at timestamptz not null default now(),
  primary key (de_usuario, a_usuario),        -- un único registro por pareja
  check (de_usuario <> a_usuario)             -- nadie se valora a sí mismo
);

-- Para buscar rápido «quién me ha marcado a mí» (matches).
create index interests_a_usuario_idx on public.interests (a_usuario);

-- Permisos de tabla: sin sesión, nada. Con sesión, ver y crear (RLS limita las filas).
revoke all on public.interests from anon, authenticated;
grant select, insert on public.interests to authenticated;

alter table public.interests enable row level security;

create policy "Cada uno ve sus decisiones"
  on public.interests for select
  to authenticated
  using (de_usuario = (select auth.uid()));

create policy "Cada uno crea sus decisiones"
  on public.interests for insert
  to authenticated
  with check (de_usuario = (select auth.uid()));

-- ============================================================
-- valorar: guarda la decisión de quien llama sobre otra persona.
-- Si ya la había valorado, NO cambia nada (no se puede cambiar de opinión) y
-- tampoco da error, para que pulsar dos veces seguidas no falle.
-- Devuelve true si hay match (los dos «interesa»), false si no.
-- ============================================================
create function public.valorar(otro_usuario uuid, decision text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  yo          uuid := auth.uid();
  mi_decision text;
begin
  if yo is null then
    raise exception 'Hace falta iniciar sesión' using errcode = '42501';
  end if;

  if valorar.decision is null or valorar.decision not in ('interesa', 'descarta') then
    raise exception 'Decisión no válida' using errcode = '22023';
  end if;

  if otro_usuario is null or otro_usuario = yo then
    raise exception 'No puedes valorarte a ti mismo' using errcode = '22023';
  end if;

  -- Los dos tienen que tener el perfil completo.
  if (
    select count(*)
    from public.profiles p
    where p.id in (yo, otro_usuario)
      and p.acepta_privacidad = true
      and p.rol in ('inquilino', 'anfitrion')
  ) <> 2 then
    raise exception 'Perfil no disponible' using errcode = '22023';
  end if;

  insert into public.interests (de_usuario, a_usuario, decision)
  values (yo, otro_usuario, valorar.decision)
  on conflict (de_usuario, a_usuario) do nothing;

  -- La decisión que cuenta es la guardada (la primera), no la que acaba de llegar.
  select i.decision into mi_decision
  from public.interests i
  where i.de_usuario = yo and i.a_usuario = otro_usuario;

  return mi_decision = 'interesa'
     and exists (
       select 1
       from public.interests i
       where i.de_usuario = otro_usuario
         and i.a_usuario = yo
         and i.decision = 'interesa'
     );
end;
$$;

-- ============================================================
-- mis_matches: personas con las que hay interés mutuo, del match más reciente
-- al más antiguo. fecha = cuándo se completó el match (la segunda decisión).
-- Solo ids, porcentajes y fechas: el nombre y la foto se leen aparte de profiles.
-- ============================================================
create function public.mis_matches()
returns table (usuario_id uuid, afinidad smallint, fecha timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  yo uuid := auth.uid();
begin
  if yo is null then
    raise exception 'Hace falta iniciar sesión' using errcode = '42501';
  end if;

  return query
    select mio.a_usuario,
           public.afinidad_entre(yo, mio.a_usuario),
           greatest(mio.created_at, suyo.created_at)
    from public.interests mio
    join public.interests suyo
      on suyo.de_usuario = mio.a_usuario
     and suyo.a_usuario = yo
     and suyo.decision = 'interesa'
    where mio.de_usuario = yo
      and mio.decision = 'interesa'
    order by 3 desc, 1;
end;
$$;

-- ============================================================
-- PERMISOS: solo los usuarios con sesión pueden ejecutarlas.
-- ============================================================
revoke all on function public.valorar(uuid, text) from public, anon, authenticated;
revoke all on function public.mis_matches()       from public, anon, authenticated;

grant execute on function public.valorar(uuid, text) to authenticated;
grant execute on function public.mis_matches()       to authenticated;

commit;
