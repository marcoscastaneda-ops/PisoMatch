import type { Metadata } from "next";
import { Aviso, PAGINA, SUBTITULO, TITULO } from "@/components/ui";

export const metadata: Metadata = {
  title: "Política de privacidad · PisoMatch",
};

// Página pública (se ve con o sin sesión): no lee la sesión ni Supabase.
// Texto provisional (PM-24). Si cambia, revisar también la casilla de /perfil.
export default function PaginaPrivacidad() {
  return (
    <main className={PAGINA}>
      <article className="flex w-full max-w-2xl flex-col gap-8 leading-[1.5] md:gap-12">
        <header className="flex flex-col gap-4">
          <h1 className={TITULO}>
            Política de privacidad
          </h1>
          <Aviso tipo="aviso">
            <strong>Versión provisional.</strong> PisoMatch es un proyecto universitario de
            CUNEF y este texto puede cambiar antes de la versión final.
          </Aviso>
          <p>
            Aquí te explicamos, de forma sencilla, qué datos tuyos guardamos, para qué los
            usamos y quién puede verlos.
          </p>
        </header>

        <Seccion titulo="Qué datos guardamos">
          <ul className="list-disc space-y-1 pl-5">
            <li>Tu correo electrónico, para crear tu cuenta e iniciar sesión.</li>
            <li>Tu nombre y tu rol (si buscas habitación o tienes una libre).</li>
            <li>
              Los datos de tu perfil: descripción, presupuesto, zona y fecha de entrada.
            </li>
            <li>Tu foto de perfil, si decides subirla.</li>
            <li>Tus respuestas al test de convivencia.</li>
          </ul>
        </Seccion>

        <Seccion titulo="Para qué los usamos">
          <p>
            Solo para que PisoMatch funcione: calcular tu afinidad con otros usuarios a partir
            del test de convivencia y mostrar tu perfil a quienes buscan compañero de piso.
          </p>
        </Seccion>

        <Seccion titulo="Quién puede verlos">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Otros usuarios con sesión iniciada pueden ver tu perfil (nombre, rol, foto y
              datos del perfil).
            </li>
            <li>
              Tus respuestas al test de convivencia <strong>no se enseñan</strong> a otros
              usuarios: solo se usan para calcular la afinidad.
            </li>
            <li>
              Tus datos de contacto solo se desbloquean cuando hay{" "}
              <strong>interés mutuo</strong>, es decir, cuando los dos habéis mostrado interés
              el uno por el otro.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="Dónde se guardan">
          <p>
            Se guardan en Supabase, el servicio de base de datos e inicio de sesión que usa
            PisoMatch. Cada usuario solo puede modificar sus propios datos.
          </p>
        </Seccion>

        <Seccion titulo="No vendemos tus datos">
          <p>No vendemos ni cedemos tus datos a nadie.</p>
        </Seccion>

        <Seccion titulo="Cómo pedir que se borren">
          <p>
            Para pedir que borremos tus datos, escribe al equipo de PisoMatch (proyecto de la
            asignatura Gestión de Proyectos con Metodologías Ágiles, CUNEF).
          </p>
        </Seccion>
      </article>
    </main>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={SUBTITULO}>{titulo}</h2>
      {children}
    </section>
  );
}
