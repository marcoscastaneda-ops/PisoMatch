-- PisoMatch · leer las preguntas del test sin sesión (PM-23: test sin registro)
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run,
-- DESPUÉS de 0001 a 0009. Avisar al equipo antes de ejecutarlo: cambia permisos.
--
-- Qué cambia:
--   Los visitantes sin cuenta (rol "anon" de Supabase) pueden LEER la tabla questions,
--   para hacer el test antes de registrarse. Solo leer: no pueden crear, editar ni borrar
--   preguntas. Las preguntas no tienen datos personales.
--
-- Qué NO cambia:
--   answers y profiles siguen cerradas para "anon" (migración 0001): sin sesión no se
--   puede leer ni guardar ninguna respuesta ni ningún perfil. Las respuestas del test
--   sin cuenta se quedan en el navegador (localStorage) hasta que la persona se registra.

begin;

-- Permiso de tabla: anon solo puede hacer SELECT en questions.
grant select on public.questions to anon;

-- RLS: la política de 0001 era solo para usuarios con sesión; esta añade a los visitantes.
create policy "Preguntas visibles sin sesión (test sin registro)"
  on public.questions for select
  to anon
  using (true);

commit;
