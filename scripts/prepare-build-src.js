import fs from 'fs-extra';
import fg from 'fast-glob';
import path from 'node:path';
import { execSync } from 'child_process';

const srcDir = 'src';
const outDir = 'build-src';

await fs.remove(outDir);

// Copiar archivos del directorio src (excluyendo archivos ofuscados y multimedia)
const srcEntries = await fg(
  [
    '**/*.js',
    '**/*.cjs',
    '**/*.ts',
    '**/*.json',
    '**/*.css',
    '**/*.html',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.ico',
    '**/*.mp3',
    '**/*.wav',
    '**/*.ogg',
    '!**/examples/**',
    '!**/__tests__/**',
    '!**/*.test.*',
    '!**/*.map',
    '!**/*.obfuscated.*',
    '!**/*.min.*'
  ],
  { cwd: srcDir, dot: true }
);

// Filtrar archivos que ya están ofuscados
const filteredEntries = [];
for (const entry of srcEntries) {
  if (entry.endsWith('.js') || entry.endsWith('.cjs')) {
    const filePath = path.join(srcDir, entry);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      // Detectar si el archivo ya está ofuscado
      if (content.includes('_0x') || content.includes('syw_0x') || content.includes('!![]')) {
        console.log(`[build:pre] Skipping already obfuscated file: ${entry}`);
        continue;
      }
    } catch (error) {
      console.warn(`[build:pre] Could not read ${entry}:`, error.message);
    }
  }
  filteredEntries.push(entry);
}

// También copiar directorios completos para asegurar que se incluyan todos los subdirectorios
const srcDirs = await fg(
  ['**/'],
  { cwd: srcDir, dot: true, onlyDirectories: true }
);

// Copiar archivos
for (const file of filteredEntries) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(outDir, file);
  await fs.ensureDir(path.dirname(destPath));
  await fs.copy(srcPath, destPath);
}

// Copiar directorios (para asegurar que se incluyan todos los subdirectorios)
for (const dir of srcDirs) {
  const srcPath = path.join(srcDir, dir);
  const destPath = path.join(outDir, dir);
  if (await fs.pathExists(srcPath)) {
    await fs.ensureDir(destPath);
    console.log(`[build:pre] Ensured directory: ${dir}`);
  }
}

// Copiar archivos específicos del directorio raíz que son necesarios
const rootFiles = [
  'script.js',
  'index.html',
  'style.css',
  'idlebossrush.css',
  'idlebossrush.html',
  'dark-theme.css',
  'arrow.mp3',
  'fireball.mp3',
  'sword.mp3',
  'VictorySound.mp3',
  'LosingSound.mp3',
  'vanish.mp3',
  'NextLevelExpTable.json',
  'AcumulatedLevelExpTable.json',
  'constructionWorker.js'
];

// Copiar directorios específicos del directorio raíz que son necesarios
const rootDirs = [
  'renderer',
  'ui',
  'utils',
  'core',
  'system'
];

for (const dir of rootDirs) {
  const srcPath = path.join('.', dir);
  const destPath = path.join(outDir, dir);
  if (await fs.pathExists(srcPath)) {
    await fs.copy(srcPath, destPath, { overwrite: false, errorOnExist: false });
    console.log(`[build:pre] Merged root directory: ${dir}/`);
  }
}

for (const file of rootFiles) {
  const srcPath = path.join('.', file);
  const destPath = path.join(outDir, file);
  if (await fs.pathExists(srcPath)) {
    await fs.copy(srcPath, destPath);
    console.log(`[build:pre] Copied root file: ${file}`);
  }
}

console.log(
  `[build:pre] Copied ${filteredEntries.length} files from ${srcDir} to ${outDir}, excluding tests, examples, and already obfuscated files.`
);

// Corregir rutas de importación para producción
console.log('[build:pre] Corrigiendo rutas de importación...');
try {
  execSync('node scripts/fix-import-paths.js', { stdio: 'inherit' });
} catch (error) {
  console.error('[build:pre] Error al corregir rutas de importación:', error.message);
  process.exit(1);
}

// --- Blindaje de producción: copiar entradas raíz y assets a build-src ---
const root = process.cwd();
const dstDir = path.join(root, outDir);
await fs.ensureDir(dstDir);

const copyIfExists = async (srcRel, dstRel) => {
  const src = path.join(root, srcRel);
  const dst = path.join(root, dstRel);
  await fs.ensureDir(path.dirname(dst));
  if (await fs.pathExists(src)) {
    await fs.copy(src, dst);
    console.log(`[build:pre] Copied ${srcRel} -> ${dstRel}`);
    return true;
  } else {
    console.log(`[build:pre] Skipped ${srcRel} (not found)`);
    return false;
  }
};

// 2.1 Copiar entradas raíz que script.js puede importar relativamente
const rootEntries = [
  'script.js',
  'perf.js',
  'index.js',
  'state.js',
  'config.js',
  'module-loader.js',
  'dynamic-imports.js',
  'head-config.js'
];

for (const fname of rootEntries) {
  const dstRel = path.join(outDir, fname);
  const copied = await copyIfExists(fname, dstRel);
  if (!copied && fname === 'perf.js') {
    await fs.outputFile(
      path.join(root, dstRel),
      `(function(g){try{g.__SYW_PERF__=g.__SYW_PERF__||{mark(){},measure(){},log(){}}}catch(e){}})(typeof window!=='undefined'?window:globalThis);`
    );
    console.log(`[build:pre] Created stub ${dstRel}`);
  }
}

// 2.2 Copiar assets de fondo comunes si existen en la raíz
const backgrounds = ['Background.png','Background.jpg','Background.jpeg','Background.webp'];
for (const name of backgrounds) {
  await copyIfExists(name, path.join(outDir, name));
}

// 2.3 Asegurar que wrappers y performance queden disponibles en build-src
await copyIfExists('performance', path.join(outDir, 'performance'));
await copyIfExists('lib', path.join(outDir, 'lib'));