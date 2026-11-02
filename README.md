# PisoMatch
Compañeros de piso por compatibilidad de convivencia

## Cómo arrancarlo
1. Instala [Node.js](https://nodejs.org) (versión 20 o superior).
2. En la carpeta del proyecto: `npm install`
3. Copia `.env.example` como `.env.local` y pega las claves de Supabase (Project Settings → API Keys). **Nunca subas `.env.local` a GitHub.**
4. Si la base de datos está vacía, ejecuta `supabase/migrations/0001_tablas_iniciales.sql` en Supabase → SQL Editor.
5. `npm run dev` y abre http://localhost:3000

Las reglas de trabajo del equipo (ramas, pull requests, cambios en tablas) están en [CLAUDE.md](CLAUDE.md).
