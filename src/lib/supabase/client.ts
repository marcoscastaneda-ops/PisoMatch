import { createBrowserClient } from "@supabase/ssr";

// Conexión a Supabase desde el navegador (componentes con "use client").
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
