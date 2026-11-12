import { PAGINA, SEPARACION_SECCIONES } from "@/components/ui";
import { CabeceraPortada } from "@/components/portada/cabecera-portada";
import { ComoFunciona } from "@/components/portada/como-funciona";
import { MatchEjemplo } from "@/components/portada/match-ejemplo";
import { Confianza } from "@/components/portada/confianza";
import { LlamadaFinal } from "@/components/portada/llamada-final";
import { PiePortada } from "@/components/portada/pie-portada";

// Portada pública (PM-52): explica PisoMatch. Cada sección está en src/components/portada/.
// Solo los botones leen la sesión (dentro de <Suspense>); el resto es igual para todos.
export default function Home() {
  return (
    <main className={PAGINA}>
      <div className={`flex w-full max-w-[1120px] flex-col ${SEPARACION_SECCIONES}`}>
        <CabeceraPortada />
        <ComoFunciona />
        <MatchEjemplo />
        <Confianza />
        <LlamadaFinal />
        <PiePortada />
      </div>
    </main>
  );
}
