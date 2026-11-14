import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Renueva la sesión de Supabase en cada petición para que el usuario no se desconecte.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // No poner código entre createServerClient y getClaims: es lo que refresca la sesión.
  const { data } = await supabase.auth.getClaims();
  const conSesion = !!data?.claims?.sub;

  // Redirecciones rápidas según la sesión. Solo al abrir páginas (GET): los envíos
  // de formularios (POST) los gestiona cada Server Action.
  // Ojo: esto no sustituye a comprobar la sesión en cada página y acción con datos.
  if (request.method === "GET") {
    const ruta = request.nextUrl.pathname;
    if (!conSesion && RUTAS_CON_SESION.includes(ruta)) {
      return redirigir(request, response, "/login");
    }
    if (conSesion && RUTAS_SIN_SESION.includes(ruta)) {
      return redirigir(request, response, "/perfil");
    }
  }

  return response;
}

// Páginas que solo se ven con la sesión iniciada (sin sesión → /login).
const RUTAS_CON_SESION = ["/perfil", "/test", "/test/respuestas", "/afinidad", "/candidatos"];
// Páginas que no tienen sentido con la sesión iniciada (con sesión → /perfil).
const RUTAS_SIN_SESION = ["/login", "/registro"];

// Redirige conservando las cookies que Supabase haya renovado en esta petición.
function redirigir(request: NextRequest, response: NextResponse, destino: string) {
  const redireccion = NextResponse.redirect(new URL(destino, request.url));
  response.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie));
  return redireccion;
}
