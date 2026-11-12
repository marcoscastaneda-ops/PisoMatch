import Link from "next/link";
import { ENLACE, TEXTO_SUAVE } from "@/components/ui";

// Pie de la portada (PM-52) con el enlace a la política de privacidad (PM-24).
export function PiePortada() {
  return (
    <footer className="flex flex-col gap-3 border-t border-borde pt-6 sm:flex-row sm:items-center sm:justify-between">
      {/* TODO PM-55: texto provisional */}
      <p className={TEXTO_SUAVE}>PisoMatch · Compañeros de piso por compatibilidad de convivencia</p>
      <Link href="/privacidad" className={`${ENLACE} self-start text-sm`}>
        Política de privacidad
      </Link>
    </footer>
  );
}
