import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Conexión a Supabase desde el servidor. Lee la sesión del usuario de las cookies,
// así que hay que crear una nueva en cada petición y usarla dentro de <Suspense>.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Desde un Server Component no se pueden escribir cookies;
            // el proxy (src/proxy.ts) ya se encarga de renovar la sesión.
          }
        },
      },
    },
  );
}
