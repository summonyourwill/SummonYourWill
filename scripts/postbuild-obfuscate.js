// scripts/postbuild-obfuscate.js
import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import JavaScriptObfuscator from "javascript-obfuscator";

const distDir = process.env.BUILD_OUT_DIR || "dist";

// Opciones: si ya tienes una config previa, colócala aquí o cárgala desde JSON.
const OBFUSCATION_OPTIONS = {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  stringArray: true,
  rotateStringArray: true,
  stringArrayThreshold: 0.75,
  // Ajusta según lo que ya usabas antes para mantener consistencia
};

const patterns = [
  `${distDir.replace(/\\/g, "/")}/**/*.js`,
  `${distDir.replace(/\\/g, "/")}/**/*.cjs`,
  `!${distDir.replace(/\\/g, "/")}/**/*.min.js`,       // opcional: no re-ofuscar minificados
  `!${distDir.replace(/\\/g, "/")}/**/vendor/**`,      // opcional: excluir vendor
];

const files = await fg(patterns);
if (!files.length) {
  console.log(`[obfuscate] No se encontraron JS en ${distDir}.`);
  process.exit(0);
}

console.log(`[obfuscate] Ofuscando ${files.length} archivos JS en ${distDir}...`);

for (const file of files) {
  const code = await fs.readFile(file, "utf8");
  const obfuscated = JavaScriptObfuscator.obfuscate(code, OBFUSCATION_OPTIONS).getObfuscatedCode();
  await fs.writeFile(file, obfuscated, "utf8");
  console.log(`[obfuscate] ${path.relative(process.cwd(), file)}`);
}

console.log("[obfuscate] Listo.");
