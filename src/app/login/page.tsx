import type { Metadata } from "next";
import Link from "next/link";
import { FormularioLogin } from "./formulario-login";
import { COLUMNA_ESTRECHA, ENLACE_EN_TEXTO, PAGINA, TARJETA, TITULO } from "@/components/ui";

export const metadata: Metadata = {
  title: "Iniciar sesión · PisoMatch",
};

// Si ya hay sesión, el proxy (src/lib/supabase/proxy.ts) lleva a /perfil antes de llegar aquí.
export default function PaginaLogin() {
  return (
    <main className={`${PAGINA} items-center`}>
      <div className={`${COLUMNA_ESTRECHA} gap-6 md:gap-8`}>
        <div className="flex flex-col gap-2 text-center">
          <h1 className={TITULO}>Inicia sesión</h1>
          <p className="text-texto-suave">Entra con tu correo y tu contraseña.</p>
        </div>

        <div className={TARJETA}>
          <FormularioLogin />
        </div>

        <p className="text-center text-sm text-texto-suave">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className={ENLACE_EN_TEXTO}>
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
