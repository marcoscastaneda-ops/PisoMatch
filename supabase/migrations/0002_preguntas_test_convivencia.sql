-- PisoMatch · preguntas del test de convivencia (paso previo a PM-11)
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run.
-- Avisar al equipo antes de ejecutarlo: añade columnas a la tabla questions.
--
-- Cómo se guardan las opciones:
--   "opciones" es una lista con las 4 respuestas ordenadas de un extremo al otro.
--   El valor de cada respuesta (1 a 4) es su posición en la lista:
--   opciones->>0 vale 1, opciones->>1 vale 2, etc. Las listas de jsonb conservan el orden.
--   El algoritmo de afinidad (PM-30) calcula la distancia entre esos valores,
--   así que NO se debe cambiar el orden de las opciones una vez haya respuestas.

begin;

-- ============================================================
-- QUESTIONS: columnas nuevas
-- ============================================================
alter table public.questions
  add column orden                   smallint unique check (orden > 0),  -- posición en el test (1, 2, 3…)
  add column bloque                  text check (bloque in ('rutina', 'habitos', 'social')),
  add column imprescindible_sugerida boolean not null default false;      -- sale resaltada en el test

comment on column public.questions.opciones is
  'Opciones ordenadas de un extremo al otro; el valor de cada una es su posición (1 = primera).';
comment on column public.questions.bloque is
  'rutina = Tu rutina · habitos = Hábitos en casa · social = Vida social y convivencia';

-- ============================================================
-- QUESTIONS: las 15 preguntas
-- ============================================================
insert into public.questions (orden, bloque, imprescindible_sugerida, texto, opciones) values
  -- Bloque 1 · Tu rutina
  (1, 'rutina', false,
   '¿A qué hora sueles acostarte entre semana?',
   '["Antes de las 23:00", "Entre las 23:00 y las 00:00", "Entre las 00:00 y la 01:00", "Después de la 01:00"]'),
  (2, 'rutina', false,
   '¿A qué hora te levantas normalmente?',
   '["Antes de las 7:00", "Entre las 7:00 y las 8:00", "Entre las 8:00 y las 9:30", "Después de las 9:30"]'),
  (3, 'rutina', false,
   '¿Cuánto tiempo pasas en casa entre semana?',
   '["Casi solo para dormir", "Las noches", "Bastantes horas", "Casi todo el día (estudio o teletrabajo)"]'),
  (4, 'rutina', false,
   '¿Te quedas en el piso los fines de semana?',
   '["Casi nunca", "Alguno al mes", "La mayoría", "Siempre"]'),

  -- Bloque 2 · Hábitos en casa
  (5, 'habitos', true,
   '¿Con qué frecuencia limpias las zonas comunes?',
   '["Nada más usarlas", "Cada día", "Una vez a la semana", "Cuando se nota"]'),
  (6, 'habitos', false,
   '¿Cuándo friegas lo que ensucias?',
   '["Al momento", "El mismo día", "Al día siguiente", "Cuando se acumula"]'),
  (7, 'habitos', false,
   '¿Cuánto ruido te molesta en casa (música, llamadas, tele)?',
   '["Necesito silencio casi siempre", "Silencio por la noche", "Ruido moderado, sin problema", "Me da igual"]'),
  (8, 'habitos', false,
   '¿Cómo prefieres organizar la compra y la comida?',
   '["Cada uno lo suyo", "Solo compartir lo básico (aceite, sal…)", "Compartir bastante", "Hacer la compra y cocinar juntos"]'),
  (9, 'habitos', true,
   '¿Qué opinas del tabaco en casa?',
   '["No fumo y no quiero humo", "No fumo, pero no me importa en el balcón", "Fumo fuera", "Fumo dentro"]'),
  (10, 'habitos', true,
   '¿Y de las mascotas?',
   '["Prefiero un piso sin mascotas", "No tengo, pero me gustan", "Quiero tener una pequeña", "Tengo perro o gato"]'),

  -- Bloque 3 · Vida social y convivencia
  (11, 'social', false,
   '¿Qué relación buscas con tus compañeros?',
   '["Solo convivir con respeto", "Cordial, de saludar y charlar", "Cenar o ver algo juntos de vez en cuando", "Ser amigos y hacer planes"]'),
  (12, 'social', false,
   '¿Con qué frecuencia te gusta recibir visitas?',
   '["Casi nunca", "Alguna vez al mes", "Cada semana", "Muy a menudo"]'),
  (13, 'social', true,
   '¿Y hacer fiestas o reuniones en casa?',
   '["Nunca", "Muy de vez en cuando y avisando", "Alguna al mes", "A menudo"]'),
  (14, 'social', true,
   '¿Con qué frecuencia se quedaría a dormir tu pareja o algún invitado?',
   '["Nunca", "De forma ocasional", "Algunas noches a la semana", "Casi siempre"]'),
  (15, 'social', false,
   'Si algo te molesta en la convivencia, ¿qué haces?',
   '["Lo hablo enseguida, cara a cara", "Espero y lo hablo con calma", "Lo comento por mensaje", "Prefiero dejarlo pasar"]');

-- Ahora que todas las preguntas tienen orden y bloque, se vuelven obligatorios.
-- (Si la tabla ya tenía preguntas de prueba sin orden ni bloque, esto falla y no se aplica nada:
--  habría que borrarlas antes desde Supabase → Table Editor.)
alter table public.questions
  alter column orden  set not null,
  alter column bloque set not null;

commit;
