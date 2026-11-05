import type { Metadata } from "next";
import Link from "next/link";
import { FormularioRegistro } from "./formulario-registro";
import { COLUMNA_ESTRECHA, ENLACE_EN_TEXTO, PAGINA, TARJETA, TITULO } from "@/components/ui";

export const metadata: Metadata = {
  title: "Crear cuenta · PisoMatch",
};

export default function PaginaRegistro() {
  return (
    <main className={`${PAGINA} items-center`}>
      <div className={`${COLUMNA_ESTRECHA} gap-6 md:gap-8`}>
        <div className="flex flex-col gap-2 text-center">
          <h1 className={TITULO}>Crea tu cuenta</h1>
          <p className="text-texto-suave">Solo necesitas un correo y una contraseña.</p>
        </div>

        <div className={TARJETA}>
          <FormularioRegistro />
        </div>

        <p className="text-center text-sm text-texto-suave">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className={ENLACE_EN_TEXTO}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
