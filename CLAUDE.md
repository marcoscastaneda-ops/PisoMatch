# PisoMatch

Webapp que conecta compañeros de piso según su compatibilidad de convivencia.
Equipo de estudiantes; explica los pasos en lenguaje sencillo y avisa cuando haya que hacer algo fuera del código (Supabase, GitHub, Jira).

## Tecnología
- Next.js 16 (App Router, `src/`), TypeScript, Tailwind CSS 4.
- Supabase para base de datos e inicio de sesión (`@supabase/ssr`).
- Next.js 16 tiene cambios importantes: antes de escribir código, consulta la guía en `node_modules/next/dist/docs/` (ver @AGENTS.md). Por ejemplo, el antiguo "middleware" ahora es `src/proxy.ts`, y con Cache Components, cualquier componente que lea la sesión o datos de Supabase debe ir dentro de `<Suspense>`.

## Estructura
- `src/app/` – páginas.
  - `registro/` – crear cuenta (PM-7). `actions.ts` es la Server Action que valida y llama a Supabase.
  - `login/` – iniciar sesión (PM-8). `actions.ts` tiene `iniciarSesion` y `cerrarSesion`.
  - `perfil/` – bienvenida y perfil del usuario (PM-12). Sección «Tus datos» (PM-13): `formulario-foto.tsx` y `formulario-datos.tsx`; las reglas de cada campo y la lista de distritos están en `datos-perfil.ts`, que usan a la vez el navegador y el servidor.
  - `privacidad/` – política de privacidad (PM-24). Página pública, se ve sin sesión.
- `src/components/barra-superior.tsx` – barra de arriba (en `layout.tsx`); con sesión muestra «Cerrar sesión».
- `src/lib/supabase/client.ts` – Supabase en el navegador (componentes `"use client"`).
- `src/lib/supabase/server.ts` – Supabase en el servidor (crear uno nuevo en cada petición).
- `src/lib/supabase/proxy.ts` + `src/proxy.ts` – renuevan la sesión en cada petición y hacen las redirecciones según la sesión (ver Decisiones).
- `supabase/migrations/` – SQL de la base de datos, numerado (`0001_...`, `0002_...`).

## Decisiones
- **Cuentas con correo y contraseña (Supabase Auth), con «Confirm email» desactivado** (Supabase → Authentication → Sign In / Providers → Email). Al registrarse, `signUp` devuelve la sesión y el usuario entra directamente, sin correo de confirmación. Si algún día se activa: hay que añadir una pantalla de «revisa tu correo», y el aviso de correo ya registrado deja de funcionar (Supabase ya no devuelve error en ese caso, por seguridad).
- Contraseña de al menos 8 caracteres (se comprueba en `src/app/registro/actions.ts`).
- La fila de `profiles` (nombre, rol y aceptación de la privacidad) se crea en `/perfil` (PM-12 y PM-24), no en el registro. El registro solo pide correo y contraseña, crea la cuenta en Supabase Auth y redirige a `/perfil` con la sesión iniciada.
- **Login (PM-8):** si el correo o la contraseña no son correctos se muestra siempre «Correo o contraseña incorrectos», sin decir cuál falla (para no revelar qué correos tienen cuenta). Al entrar se va a `/perfil`. «Cerrar sesión» cierra la sesión solo en ese dispositivo (`scope: "local"`) y lleva a `/`.
- **Redirecciones según la sesión**, en `src/lib/supabase/proxy.ts` (solo al abrir páginas, peticiones GET): sin sesión, `/perfil` → `/login`; con sesión, `/login` y `/registro` → `/perfil`. Para añadir otra página privada, añadirla a `RUTAS_CON_SESION`. Es una comprobación rápida: cada página y Server Action que use datos del usuario debe seguir comprobando la sesión por su cuenta (como hace `/perfil`).
- **Privacidad (PM-24):** la casilla «Acepto la política de privacidad» es obligatoria en la bienvenida de `/perfil`; `crearPerfil` la comprueba también en el servidor y guarda `acepta_privacidad = true`. Los perfiles sin aceptar ven en `/perfil` una pantalla para aceptarla antes de seguir. `/privacidad` debe seguir siendo pública: no añadirla a las rutas que exigen sesión.
- **Tus datos (PM-13):** el presupuesto (en euros al mes, entero de 0 a 10 000) y la zona son obligatorios; la descripción (máximo 500 caracteres) y la fecha de entrada, opcionales. La zona se elige entre los 21 distritos de Madrid (`DISTRITOS_MADRID`) y se guarda el nombre tal cual: no cambiar esos textos, porque servirán para filtrar matches. Cada regla se comprueba en el navegador y, otra vez, en el servidor con la misma función (`validarDatosPerfil`).
- **Fotos de perfil (PM-13):** van en el bucket **privado** de Storage `fotos-perfil` (migración 0004): solo JPG o PNG de hasta 5 MB, en `<id del usuario>/<fecha-hora>.jpg|png`. Cada usuario solo puede subir, cambiar o borrar lo de su carpeta; los usuarios con sesión pueden ver todas. En `profiles.foto_url` se guarda la **ruta**, no un enlace; para enseñar la foto, el servidor pide un enlace temporal (`createSignedUrl`, 1 hora). Al cambiar la foto se borra la anterior. Como Next solo acepta 1 MB por Server Action, `next.config.ts` sube el límite a `6mb`.

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
