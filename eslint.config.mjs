import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// PM-41 · Guía de estilo (docs/guia-estilo.md): solo modo claro y solo los colores de la guía.
// Prohíbe en las clases: variantes dark:, colores de Tailwind por defecto (zinc-500, red-600…)
// y menta/melocotón como color de texto.
const CLASES_FUERA_DE_GUIA =
  "/(^|[\\s:'\"`])(dark:|(bg|text|border|ring|outline|fill|stroke|divide|placeholder|accent|decoration|from|via|to|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]|text-(menta|melocoton)\\b)/";
const MENSAJE_ESTILO =
  "Fuera de la guía de estilo (docs/guia-estilo.md): sin dark:, sin colores de Tailwind por defecto y nunca texto menta/melocotón. Usa los colores de la guía (marino, verde, texto-suave, error…) o las piezas de src/components/ui.tsx.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: `Literal[value=${CLASES_FUERA_DE_GUIA}]`, message: MENSAJE_ESTILO },
        { selector: `TemplateElement[value.raw=${CLASES_FUERA_DE_GUIA}]`, message: MENSAJE_ESTILO },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
