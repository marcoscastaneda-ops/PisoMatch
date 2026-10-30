-- PisoMatch · tablas iniciales
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run.
-- Cualquier cambio posterior va en un archivo nuevo (0002_..., 0003_...) y se avisa al equipo.

-- ============================================================
-- PROFILES: un perfil por usuario registrado
-- ============================================================
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  rol               text not null check (rol in ('inquilino', 'anfitrion')),
  nombre            text not null,
  foto_url          text,
  descripcion       text,
  presupuesto       numeric(8, 2) check (presupuesto >= 0),
  zona              text,
  fecha_entrada     date,
  acepta_privacidad boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- QUESTIONS: preguntas del test de convivencia
-- ============================================================
create table public.questions (
  id         bigint generated always as identity primary key,
  texto      text not null,
  opciones   jsonb not null default '[]'::jsonb
             check (jsonb_typeof(opciones) = 'array'),  -- ej. ["Sí", "No", "A veces"]
  created_at timestamptz not null default now()
);

-- ============================================================
-- ANSWERS: respuestas de cada usuario a cada pregunta
-- ============================================================
create table public.answers (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  question_id    bigint not null references public.questions (id) on delete cascade,
  respuesta      text not null,
  importancia    text not null default 'bastante'
                 check (importancia in ('poco', 'bastante', 'mucho')),
  imprescindible boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (user_id, question_id)  -- una sola respuesta por pregunta
);

create index answers_question_id_idx on public.answers (question_id);

-- Mantiene updated_at al día al editar un perfil
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- PERMISOS DE TABLA: quién puede entrar a cada tabla
-- Los visitantes sin sesión (anon) no tienen acceso a nada.
-- Los usuarios con sesión (authenticated) entran, y RLS limita qué filas tocan.
-- ============================================================
revoke all on public.profiles, public.questions, public.answers from anon, authenticated;
grant select, insert, update, delete on public.profiles, public.answers to authenticated;
grant select on public.questions to authenticated;

-- ============================================================
-- SEGURIDAD (RLS): cada usuario solo puede tocar sus propios datos
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.questions enable row level security;
alter table public.answers   enable row level security;

-- PROFILES: cualquier usuario con sesión puede ver perfiles (para buscar compañeros),
-- pero solo crea, edita o borra el suyo.
create policy "Perfiles visibles para usuarios con sesión"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Cada usuario crea su perfil"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Cada usuario edita su perfil"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Cada usuario borra su perfil"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

-- QUESTIONS: solo lectura para usuarios con sesión. Se añaden/editan desde el panel de Supabase.
create policy "Preguntas visibles para usuarios con sesión"
  on public.questions for select
  to authenticated
  using (true);

-- ANSWERS: cada usuario solo ve y gestiona sus propias respuestas.
-- (El cálculo de compatibilidad se hará más adelante con una función segura en la base de datos.)
create policy "Cada usuario ve sus respuestas"
  on public.answers for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario crea sus respuestas"
  on public.answers for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario edita sus respuestas"
  on public.answers for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario borra sus respuestas"
  on public.answers for delete
  to authenticated
  using ((select auth.uid()) = user_id);
