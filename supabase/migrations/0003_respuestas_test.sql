-- PisoMatch · respuestas del test de convivencia (PM-11)
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run,
-- DESPUÉS de 0002_preguntas_test_convivencia.sql.
-- Avisar al equipo antes de ejecutarlo: cambia columnas de la tabla answers.
--
-- Qué cambia en answers:
--   1. "respuesta" pasa de texto a número (1 a 4): el valor de la opción elegida,
--      que es su posición en questions.opciones. Es lo que usará el algoritmo de afinidad (PM-30).
--   2. "importancia" admite poco / algo / mucho (antes poco / bastante / mucho) y queda vacía
--      (null) hasta que el usuario la elija. Se programará en PM-14.
--   3. "imprescindible" queda vacía (null) hasta que el usuario la marque. Se programará en PM-16.
--
-- Seguridad (RLS): no cambia. Las políticas de 0001 ya hacen que cada usuario
-- solo pueda leer, guardar, editar y borrar sus propias respuestas.
--
-- Si answers ya tuviera respuestas de prueba con texto que no sea un número,
-- esto falla y no se aplica nada: habría que borrarlas antes desde Supabase → Table Editor.

begin;

-- 1. respuesta: número del 1 al 4
alter table public.answers
  alter column respuesta type smallint using respuesta::smallint;

alter table public.answers
  add constraint answers_respuesta_check check (respuesta between 1 and 4);

-- 2. importancia: poco / algo / mucho, vacía por ahora
alter table public.answers
  drop constraint answers_importancia_check,
  alter column importancia drop default,
  alter column importancia drop not null;

-- Vacía la importancia de las respuestas de prueba que ya hubiera (eran el valor por defecto).
update public.answers set importancia = null where importancia is not null;

alter table public.answers
  add constraint answers_importancia_check check (importancia in ('poco', 'algo', 'mucho'));

-- 3. imprescindible: vacía por ahora
alter table public.answers
  alter column imprescindible drop default,
  alter column imprescindible drop not null;

-- Igual con imprescindible.
update public.answers set imprescindible = null where imprescindible is not null;

comment on column public.answers.respuesta is
  'Valor de la opción elegida: su posición en questions.opciones (1 = primera).';
comment on column public.answers.importancia is
  'Cuánto le importa la pregunta al usuario: poco, algo o mucho. Null = sin elegir (PM-14).';
comment on column public.answers.imprescindible is
  'Si el usuario marca la pregunta como imprescindible. Null = sin elegir (PM-16).';

commit;
