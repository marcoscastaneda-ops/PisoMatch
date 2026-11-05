# Guía de estilo de PisoMatch

> Historia PM-41 «Definir el estilo visual y logo» · Épica Marca y validación · Propuesta A2 · Noviembre 2026
> Lema: **Que nadie elija con quién vivir a ciegas.**
>
> Nota para Claude Code: esta guía es la fuente de verdad del estilo. Usa exactamente estos valores (hex, px, pesos). La web es *mobile first*: diseña primero a 375 px de ancho y amplía desde ahí. La sección final trae la configuración de Tailwind lista para copiar.

## Logo

**Concepto:** dos mitades de un corazón (marino y menta) que no son iguales pero encajan; donde se cruzan nace un tercer color, el verde, que es la convivencia; y encima, el tejado: no buscas un piso, buscas con quién vivirlo.

### Archivos y cuándo se usa cada uno

| Archivo | Qué es | Cuándo usarlo |
|---|---|---|
| `logo.svg` / `logo.png` | Logo completo a color (símbolo + «pisomatch») | Por defecto: cabecera de la web, página de inicio, registro, documentos. Sobre fondo crema o blanco |
| `logo-negativo.svg` | Logo completo para fondos oscuros (tejado y «piso» en crema, «match» en menta) | Sobre fondo marino (`#1B2A49`) o fotos oscuras |
| `logo-una-tinta.svg` | Logo completo en un solo color marino, corazón macizo | Impresión en blanco y negro, sellos, cuando no se pueden usar colores |
| `logo-una-tinta-blanco.svg` | Igual, en blanco | Sobre fondos de color donde el logo a color no se lee |
| `logo-icono.svg` / `logo-icono.png` | Solo el símbolo (tejado + corazón), fondo transparente | Foto de perfil, avatar por defecto, espacios cuadrados pequeños |
| `logo-icono-una-tinta.svg` | Símbolo en un solo color | Usos monocromo pequeños |
| `icono-app.svg` | Símbolo sobre cuadrado marino con esquinas redondeadas | **Favicon** (icono de la pestaña del navegador) e icono de app/redes. En Next.js: copiarlo como `app/icon.svg` |

- En la cabecera móvil, el logo completo se muestra a **32 px de alto** (unos 130 px de ancho). En escritorio, 40 px de alto.
- El texto «pisomatch» del logo va siempre en **minúsculas** y es un dibujo (ya está convertido a formas en el SVG, no depende de la fuente). En textos corridos la marca se escribe **PisoMatch**.
- Tamaño mínimo: logo completo 24 px de alto; símbolo solo 16 px.

### Espacio mínimo alrededor
Deja libre alrededor del logo, por los cuatro lados, como mínimo **la mitad del alto del corazón** (en la cabecera móvil: 8 px). Nada de texto, bordes ni otros iconos dentro de esa zona.

### Usos prohibidos
- No cambiar los colores ni intercambiar las dos mitades del corazón.
- No deformar (estirar o aplastar), girar ni inclinar el logo.
- No añadir sombras, contornos, degradados ni efectos.
- No separar el tejado del corazón ni cambiar su posición.
- No poner el logo a color sobre fondo menta, verde o melocotón: ahí se usa la versión de una tinta marino.
- No reescribir «pisomatch» con otra fuente.

## Colores

### Colores de marca

| Nombre | Hex | Uso |
|---|---|---|
| Marino (primario) | `#1B2A49` | Botón principal, titulares, texto principal, cabecera oscura |
| Verde (secundario) | `#14806A` | Enlaces, textos destacados, iconos activos, foco de los campos |
| Menta (acento) | `#3DDC97` | Afinidad y match: porcentaje de afinidad, insignias, barras de progreso del test. **Nunca como color de texto**: el texto sobre menta va en marino |
| Melocotón (cálido) | `#FFB98F` | Toques de calidez: ilustraciones, etiquetas, fondos de destacados. **Nunca como color de texto**: el texto sobre melocotón va en marino |

### Neutros

| Nombre | Hex | Uso |
|---|---|---|
| Crema (fondo) | `#FBF6EE` | Fondo general de todas las páginas |
| Blanco (superficie) | `#FFFFFF` | Tarjetas, campos de formulario, modales |
| Texto | `#1B2A49` | Texto principal (es el marino) |
| Texto suave | `#5B6478` | Textos secundarios, ayudas bajo los campos, fechas, pies |
| Borde | `#E9E4DA` | Bordes de tarjetas y separadores |
| Borde de campo | `#7C8497` | Borde de los campos de formulario y casillas (tiene que verse bien) |
| Desactivado fondo | `#EEEAE3` | Fondo de botones y campos desactivados |
| Desactivado texto | `#6B7385` | Texto de botones y campos desactivados |

### Estados

| Nombre | Hex | Uso |
|---|---|---|
| Éxito | `#0F6B4F` | Texto e icono de mensajes de éxito («Perfil guardado») |
| Éxito fondo | `#E3F7EC` | Fondo del aviso de éxito |
| Error | `#B42318` | Texto de error, borde de campo con error, icono |
| Error fondo | `#FDECEA` | Fondo del aviso de error |
| Aviso | `#9A4A12` | Texto de advertencia («Te faltan 3 preguntas») |
| Aviso fondo | `#FFF1E6` | Fondo del aviso de advertencia |

### Contraste comprobado (WCAG AA: mínimo 4,5:1 para texto normal)

| Texto sobre fondo | Contraste | ¿Cumple? |
|---|---|---|
| Marino `#1B2A49` sobre crema `#FBF6EE` | 13,2:1 | Sí |
| Marino sobre blanco | 14,3:1 | Sí |
| Blanco sobre marino (botón principal) | 14,3:1 | Sí |
| Verde `#14806A` sobre blanco | 4,9:1 | Sí |
| Verde `#14806A` sobre crema | 4,5:1 | Sí (justo: no usar el verde en textos de menos de 14 px sobre crema) |
| Blanco sobre verde | 4,9:1 | Sí |
| Marino sobre menta `#3DDC97` | 8,1:1 | Sí |
| Marino sobre melocotón `#FFB98F` | 8,5:1 | Sí |
| Texto suave `#5B6478` sobre crema | 5,5:1 | Sí |
| Texto suave sobre blanco | 5,9:1 | Sí |
| Error `#B42318` sobre blanco / sobre su fondo | 6,6:1 / 5,8:1 | Sí |
| Aviso `#9A4A12` sobre su fondo | 5,6:1 | Sí |
| Éxito `#0F6B4F` sobre su fondo | 5,8:1 | Sí |
| Borde de campo `#7C8497` sobre blanco (elemento gráfico, mínimo 3:1) | 3,8:1 | Sí |

**Combinaciones prohibidas:** texto menta o melocotón sobre blanco o crema (no se leen), y texto blanco sobre menta o melocotón.

## Tipografía

- Fuente única: **Poppins** (Google Fonts, gratuita). En Next.js se carga con `next/font/google`.
- Pesos: **400 Regular** (textos), **600 SemiBold** (botones, etiquetas, nombres en tarjetas), **700 Bold** (títulos y cifras de afinidad).
- Alternativa del sistema si no carga: `ui-sans-serif, system-ui, sans-serif`.

| Estilo | Móvil | Escritorio (≥ 768 px) | Interlineado | Peso | Color |
|---|---|---|---|---|---|
| Título (h1) | 28 px | 36 px | 1,2 | 700 | Marino |
| Subtítulo (h2) | 20 px | 24 px | 1,3 | 700 | Marino |
| Texto | 16 px | 16 px | 1,5 | 400 | Marino |
| Texto pequeño | 13 px | 14 px | 1,4 | 400 | Texto suave |
| Botón | 16 px | 16 px | 1 | 600 | Según botón |
| Cifra de afinidad | 32 px | 40 px | 1 | 700 | Marino sobre menta |

- Títulos con espaciado entre letras de `-0.01em`. Nunca escribir textos enteros en mayúsculas, salvo etiquetas muy cortas (máximo 3 palabras) a 12 px, 600 y `letter-spacing: 0.08em`.
- Los campos de formulario usan siempre **16 px** (por debajo, el iPhone hace zoom al escribir).

## Componentes

### Botones
Todos: alto mínimo **48 px** (cómodo para el dedo), padding **14 px 24 px**, radio **999 px** (forma de píldora), Poppins 600 16 px. En móvil, el botón principal de cada pantalla ocupa todo el ancho.

| Botón | Fondo | Texto | Borde | Al pasar / pulsar |
|---|---|---|---|---|
| Principal | `#1B2A49` | `#FFFFFF` | ninguno | Fondo `#2A3B61` |
| Secundario | `#FFFFFF` | `#1B2A49` | 2 px `#1B2A49` | Fondo `#FBF6EE` |
| Texto (enlace) | transparente | `#14806A` | ninguno | Subrayado |
| Desactivado | `#EEEAE3` | `#6B7385` | ninguno | Sin cambio, `cursor: not-allowed` |

- Foco con teclado (todos): anillo de 3 px `#3DDC97` separado 2 px del botón.
- Solo **un botón principal por pantalla**: es la acción más importante (por ejemplo «Hacer el test»).

### Tarjeta (perfil de candidato, anuncio de habitación)
- Fondo `#FFFFFF`, borde 1 px `#E9E4DA`, radio **20 px**, padding **16 px** (móvil) / **24 px** (escritorio).
- Sombra: `0 2px 8px rgba(27, 42, 73, 0.06)`. Al pasar el ratón (si es clicable): `0 6px 20px rgba(27, 42, 73, 0.10)`.
- Foto arriba con radio 16 px. Nombre en Poppins 600 18 px, datos en texto pequeño.
- Afinidad: insignia en forma de píldora, fondo `#3DDC97`, texto `#1B2A49`, Poppins 700 14 px, padding 4 px 12 px (ejemplo: «92 %»).

### Campo de formulario
- Alto 48 px, padding 12 px 16 px, radio **12 px**, texto 16 px marino, fondo `#FFFFFF`.
- Etiqueta encima: Poppins 600 14 px marino, separada 6 px del campo. Ayuda debajo: 13 px texto suave.
- Placeholder (texto de ejemplo dentro del campo): `#5B6478`.

| Estado | Borde | Extra |
|---|---|---|
| Normal | 1,5 px `#7C8497` | — |
| Foco | 2 px `#14806A` | Anillo `0 0 0 3px rgba(61, 220, 151, 0.35)` |
| Error | 2 px `#B42318` | Mensaje debajo en 13 px `#B42318` con icono. El error se explica con texto, no solo con el color |
| Desactivado | 1,5 px `#E9E4DA` | Fondo `#EEEAE3`, texto `#6B7385` |

### Avisos (mensajes de éxito, error y advertencia)
Radio 12 px, padding 12 px 16 px, texto 14 px, fondo y texto según la tabla de estados. Sin borde.

## Espaciado y bordes

- Escala de espaciado (múltiplos de 4): **4, 8, 12, 16, 24, 32, 48, 64 px**.
- Margen lateral de la página: 16 px en móvil, 24 px en tablet; contenido centrado con ancho máximo 1120 px en escritorio (formularios y test: máximo 480 px).
- Separación entre secciones: 32 px en móvil, 48 px en escritorio. Entre campos de un formulario: 16 px.

| Radio | Valor | Dónde |
|---|---|---|
| Pequeño | 8 px | Casillas, etiquetas pequeñas |
| Medio | 12 px | Campos, avisos |
| Grande | 20 px | Tarjetas, modales |
| Píldora | 999 px | Botones, insignia de afinidad |

| Sombra | Valor | Dónde |
|---|---|---|
| Suave | `0 2px 8px rgba(27, 42, 73, 0.06)` | Tarjetas |
| Media | `0 6px 20px rgba(27, 42, 73, 0.10)` | Tarjeta al pasar el ratón, menús |
| Fuerte | `0 16px 40px rgba(27, 42, 73, 0.16)` | Modales |

## Tono de los textos

- PisoMatch **habla de tú**, como un amigo que ya ha compartido piso: cercano y con naturalidad, nunca corporativo ni con jerga.
- **Claro y corto:** frases de menos de 20 palabras, una idea por frase. El usuario va con prisa y desde el móvil.
- **Transmite confianza:** explica por qué pedimos cada dato y qué hacemos con él; no prometemos lo que la web no hace.
- **Positivo pero honesto:** cuando algo falla, decimos qué ha pasado y cómo arreglarlo, sin culpar al usuario. Emojis, como mucho uno y solo en momentos de celebración (un match).

**Ejemplo de bienvenida:**
> ¡Hola, Lucía! Antes de buscar piso, toca conocerte un poco. Responde 15 preguntas sobre tu día a día y te enseñaremos con quién encajas de verdad. Son unos 5 minutos.

**Ejemplo de error:**
> Ese correo ya tiene una cuenta. ¿Quieres iniciar sesión o recuperar tu contraseña?

## Configuración para la web (Next.js + Tailwind)

Cargar la fuente en `app/layout.js`:

```js
import { Poppins } from "next/font/google";
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-poppins" });
// <html lang="es" className={poppins.variable}> <body className="font-sans bg-crema text-marino">
```

**Tailwind v4** (si `app/globals.css` empieza por `@import "tailwindcss";`), añadir:

```css
@theme {
  --font-sans: var(--font-poppins), ui-sans-serif, system-ui, sans-serif;
  --color-marino: #1B2A49;
  --color-marino-hover: #2A3B61;
  --color-verde: #14806A;
  --color-menta: #3DDC97;
  --color-melocoton: #FFB98F;
  --color-crema: #FBF6EE;
  --color-superficie: #FFFFFF;
  --color-texto: #1B2A49;
  --color-texto-suave: #5B6478;
  --color-borde: #E9E4DA;
  --color-borde-campo: #7C8497;
  --color-desactivado: #EEEAE3;
  --color-desactivado-texto: #6B7385;
  --color-exito: #0F6B4F;
  --color-exito-fondo: #E3F7EC;
  --color-error: #B42318;
  --color-error-fondo: #FDECEA;
  --color-aviso: #9A4A12;
  --color-aviso-fondo: #FFF1E6;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --shadow-suave: 0 2px 8px rgba(27, 42, 73, 0.06);
  --shadow-media: 0 6px 20px rgba(27, 42, 73, 0.10);
  --shadow-fuerte: 0 16px 40px rgba(27, 42, 73, 0.16);
}
```

**Tailwind v3** (si existe `tailwind.config.js`), poner los mismos valores en `theme.extend`:

```js
theme: { extend: {
  fontFamily: { sans: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"] },
  colors: {
    marino: { DEFAULT: "#1B2A49", hover: "#2A3B61" }, verde: "#14806A", menta: "#3DDC97",
    melocoton: "#FFB98F", crema: "#FBF6EE", superficie: "#FFFFFF", texto: "#1B2A49",
    "texto-suave": "#5B6478", borde: "#E9E4DA", "borde-campo": "#7C8497",
    desactivado: "#EEEAE3", "desactivado-texto": "#6B7385",
    exito: "#0F6B4F", "exito-fondo": "#E3F7EC", error: "#B42318", "error-fondo": "#FDECEA",
    aviso: "#9A4A12", "aviso-fondo": "#FFF1E6",
  },
  borderRadius: { sm: "8px", md: "12px", lg: "20px" },
  boxShadow: { suave: "0 2px 8px rgba(27,42,73,0.06)", media: "0 6px 20px rgba(27,42,73,0.10)", fuerte: "0 16px 40px rgba(27,42,73,0.16)" },
} }
```

Clases de ejemplo:

```html
<!-- Botón principal -->
<button class="w-full min-h-12 rounded-full bg-marino px-6 py-3.5 font-semibold text-white hover:bg-marino-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-menta focus-visible:ring-offset-2 disabled:bg-desactivado disabled:text-desactivado-texto">Hacer el test</button>
<!-- Tarjeta -->
<div class="rounded-lg border border-borde bg-white p-4 shadow-suave md:p-6">…</div>
<!-- Insignia de afinidad -->
<span class="rounded-full bg-menta px-3 py-1 text-sm font-bold text-marino">92 %</span>
<!-- Campo -->
<input class="h-12 w-full rounded-md border-[1.5px] border-borde-campo bg-white px-4 text-base text-marino placeholder:text-texto-suave focus:border-2 focus:border-verde focus:outline-none focus:ring-[3px] focus:ring-menta/35" />
```

Para cumplir el escenario 2 de PM-41: la **página de inicio** y la de **registro** deben mostrar `logo.svg` en la cabecera (32 px de alto en móvil), fondo crema, textos en marino y el botón principal en marino.
