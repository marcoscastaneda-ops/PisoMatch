// Hook de Claude Code (PM-41): después de que Claude edite o cree un archivo de src/,
// pasa ESLint solo por ese archivo. Si hay errores (por ejemplo, colores fuera de la
// guía de estilo, docs/guia-estilo.md), se los devuelve a Claude para que los corrija.
// Se configura en .claude/settings.json y lo usa todo el equipo automáticamente.
import { spawnSync } from "node:child_process";
import path from "node:path";

let entrada = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (trozo) => (entrada += trozo));
process.stdin.on("end", () => {
  let archivo;
  try {
    const datos = JSON.parse(entrada);
    archivo = datos.tool_response?.filePath ?? datos.tool_input?.file_path;
  } catch {
    process.exit(0); // entrada rara: no bloquear nada
  }
  if (!archivo) process.exit(0);

  const raiz = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const relativo = path.relative(raiz, path.resolve(raiz, archivo)).split(path.sep).join("/");
  // Solo código de la web (src/), y solo .ts/.tsx/.js/.jsx/.mjs.
  if (!/^src\/.+\.(tsx?|jsx?|mjs)$/.test(relativo)) process.exit(0);

  const eslint = path.join(raiz, "node_modules", "eslint", "bin", "eslint.js");
  const resultado = spawnSync(process.execPath, [eslint, "--no-warn-ignored", relativo], {
    cwd: raiz,
    encoding: "utf8",
  });

  if (resultado.status === 1) {
    process.stderr.write(
      `ESLint ha encontrado errores en ${relativo}. Corrígelos antes de seguir ` +
        `(estilo visual: docs/guia-estilo.md y src/components/ui.tsx):\n${resultado.stdout}`,
    );
    process.exit(2); // 2 = Claude recibe el mensaje y lo corrige
  }
  process.exit(0); // sin errores, o ESLint no se pudo ejecutar (no instalado): no molestar
});
