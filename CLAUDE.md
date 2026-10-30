# PisoMatch

Webapp que conecta compañeros de piso según su compatibilidad de convivencia.
Equipo de estudiantes; explica los pasos en lenguaje sencillo y avisa cuando haya que hacer algo fuera del código (Supabase, GitHub, Jira).

## Tecnología
- Next.js 16 (App Router, `src/`), TypeScript, Tailwind CSS 4.
- Supabase para base de datos e inicio de sesión (`@supabase/ssr`).
- Next.js 16 tiene cambios importantes: antes de escribir código, consulta la guía en `node_modules/next/dist/docs/` (ver @AGENTS.md). Por ejemplo, el antiguo "middleware" ahora es `src/proxy.ts`, y con Cache Components, cualquier componente que lea la sesión o datos de Supabase debe ir dentro de `<Suspense>`.

## Estructura
- `src/app/` – páginas.
- `src/lib/supabase/client.ts` – Supabase en el navegador (componentes `"use client"`).
- `src/lib/supabase/server.ts` – Supabase en el servidor (crear uno nuevo en cada petición).
- `src/lib/supabase/proxy.ts` + `src/proxy.ts` – renuevan la sesión en cada petición.
- `supabase/migrations/` – SQL de la base de datos, numerado (`0001_...`, `0002_...`).

## Arrancar en local
1. `npm install`
2. Copiar `.env.example` como `.env.local` y rellenar las claves (Supabase → Project Settings → API Keys).
3. `npm run dev` y abrir http://localhost:3000

## Reglas del equipo
1. **Una rama por historia de Jira**, con el formato `PM-<número>-<descripción-corta>`, por ejemplo `PM-7-registro`. Se crea desde `main` actualizado (`git switch main && git pull && git switch -c PM-7-registro`).
2. **Nunca trabajar ni hacer push directamente a `main`.** Todo entra en `main` mediante **pull request**, revisada por al menos otro miembro del equipo. El título de la PR empieza por la clave de Jira (ej. `PM-7: registro de usuarios`).
3. **No cambiar las tablas sin avisar al equipo.** Cualquier cambio en la base de datos (tablas, columnas, políticas RLS) va en un archivo **nuevo** en `supabase/migrations/` (nunca editar uno ya ejecutado), se explica en la PR y se avisa al equipo antes de ejecutarlo en Supabase.
4. **Las claves nunca se suben a GitHub.** Van solo en `.env.local` (ignorado por Git). Nunca usar la clave `service_role`/secret en el código de la web.
5. Mantener RLS activada en todas las tablas: cada usuario solo puede modificar sus propios datos.
6. Antes de abrir una PR: `npm run lint` y `npm run build` deben pasar sin errores.
