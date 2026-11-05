import Link from "next/link";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, TITULO } from "@/components/ui";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center sm:px-6">
      <h1 className={TITULO}>PisoMatch</h1>
      <p className="max-w-md text-lg leading-[1.5]">
        Compañeros de piso por compatibilidad de convivencia
      </p>
      <div className="flex w-full max-w-[480px] flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
        <Link href="/registro" className={`${BOTON_PRINCIPAL} sm:w-auto`}>
          Crear cuenta
        </Link>
        <Link href="/login" className={BOTON_SECUNDARIO}>
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
