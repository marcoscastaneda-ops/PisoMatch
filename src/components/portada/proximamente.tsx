import { ETIQUETA_SUGERENCIA } from "@/components/ui";

// Etiqueta «Próximamente» para lo que la portada cuenta pero la web aún no hace (matches y
// contacto: PM-35, PM-36 y PM-39). Cada uso lleva su propio TODO para quitarla.
export function Proximamente() {
  return <span className={ETIQUETA_SUGERENCIA}>Próximamente</span>;
}
