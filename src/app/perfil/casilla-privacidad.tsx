import { ENLACE_EN_TEXTO } from "@/components/ui";

// Casilla obligatoria para aceptar la política de privacidad (PM-24).
// Se usa en la bienvenida y en la pantalla de aceptar privacidad.
// El enlace abre /privacidad en otra pestaña para no perder lo escrito en el formulario.
export function CasillaPrivacidad() {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name="acepta_privacidad" required className="casilla" />
      <span>
        He leído y acepto la{" "}
        <a
          href="/privacidad"
          target="_blank"
          rel="noopener noreferrer"
          className={ENLACE_EN_TEXTO}
        >
          política de privacidad
        </a>
        .
      </span>
    </label>
  );
}
