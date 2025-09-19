import fg from 'fast-glob';
import fs from 'node:fs/promises';
import path from 'node:path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const srcDir = process.env.BUILD_SRC_DIR || 'build-src';
const configPath = process.env.OBF_CONFIG || 'obfuscator.config.json';
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));

const base = srcDir.replace(/\\/g, '/');
const patterns = [`${base}/**/*.js`, `${base}/**/*.cjs`];

const files = await fg(patterns, { ignore: ['**/node_modules/**', '**/*.bin'] });
if (!files.length) {
  console.log(`[obfuscate] No se encontraron JS en ${srcDir}.`);
  process.exit(0);
}

// Excluir archivos críticos que deben permanecer como ESM legible por import()
const filesToObfuscate = files.filter(f => !/\bbuild-src[\\\/]script\.js$/i.test(f));

console.log(`[obfuscate] Ofuscando ${filesToObfuscate.length} archivos JS en ${srcDir}...`);

for (const file of filesToObfuscate) {
  const code = await fs.readFile(file, 'utf8');
  const obfuscated = JavaScriptObfuscator.obfuscate(code, config).getObfuscatedCode();
  await fs.writeFile(file, obfuscated, 'utf8');
  console.log(`[obfuscate] ${path.relative(process.cwd(), file)}`);
}

console.log('[obfuscate] Listo.');
