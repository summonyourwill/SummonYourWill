// obfuscate.cjs
// Build seguro: copia proyecto a /dist, minifica HTML/CSS, bundlea y ofusca JS.
// Ejecuta: node obfuscate.cjs

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const glob = require('glob');
const { minify: minifyHTML } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const { build } = require('esbuild');
const JavaScriptObfuscator = require('javascript-obfuscator');

const projectDir = __dirname;
const srcDir = projectDir;
const distDir = path.join(projectDir, 'dist');

const JS_EXCLUDE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/*.min.js',
  '**/obfuscate.cjs',
  '**/ecosystem.config.js'
];

const OBFUSCATOR_OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayRotate: true,
  rotateStringArray: true,
  stringArrayThreshold: 1,
  disableConsoleOutput: true,
  transformObjectKeys: true,
  renameGlobals: true,
  numbersToExpressions: true,
  splitStrings: true,
  splitStringsChunkLength: 5,
  simplify: true,
  target: 'browser',
  selfDefending: true,
  debugProtection: true,
  debugProtectionInterval: 4000,
};

const HTML_MINIFY_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  minifyCSS: true,
  minifyJS: true
};

const isExcluded = (file) => JS_EXCLUDE.some(pat =>
  glob.hasMagic(pat)
    ? glob.sync(pat, { cwd: srcDir, nodir: true, matchBase: true })
        .some(x => path.resolve(srcDir, x) === path.resolve(file))
    : false
);

// Copia todo a /dist filtrando node_modules, dist y archivos de control
async function copyProject() {
  await fse.remove(distDir);
  await fse.ensureDir(distDir);
  const entries = await fse.readdir(srcDir);
  for (const entry of entries) {
    if (['node_modules', 'dist', 'obfuscate.cjs', 'package-lock.json'].includes(entry)) continue;
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(distDir, entry);
    await fse.copy(srcPath, destPath);
  }
}

// Minifica HTML en /dist
async function processHTML() {
  const files = glob.sync('**/*.html', { cwd: distDir, nodir: true });
  for (const rel of files) {
    const abs = path.join(distDir, rel);
    try {
      const src = await fse.readFile(abs, 'utf8');
      const out = await minifyHTML(src, HTML_MINIFY_OPTIONS);
      await fse.writeFile(abs, out, 'utf8');
      console.log('[HTML]', rel, 'minificado');
    } catch (e) {
      console.warn('[HTML] Falló minificado en', rel, e.message);
    }
  }
}

// Minifica CSS en /dist
async function processCSS() {
  const files = glob.sync('**/*.css', { cwd: distDir, nodir: true });
  const cleaner = new CleanCSS({ level: 2 });
  for (const rel of files) {
    const abs = path.join(distDir, rel);
    try {
      const src = await fse.readFile(abs, 'utf8');
      const { styles } = cleaner.minify(src);
      await fse.writeFile(abs, styles, 'utf8');
      console.log('[CSS]', rel, 'minificado');
    } catch (e) {
      console.warn('[CSS] Falló minificado en', rel, e.message);
    }
  }
}

// Bundlea + ofusca cada JS (excepto librerías .min.js y excluidos)
async function processJS() {
  const files = glob.sync('**/*.js', { cwd: srcDir, nodir: true, ignore: JS_EXCLUDE });
  for (const rel of files) {
    const srcAbs = path.join(srcDir, rel);
    const outAbs = path.join(distDir, rel);
    await fse.ensureDir(path.dirname(outAbs));
    try {
      const result = await build({
        entryPoints: [srcAbs],
        bundle: true,
        minify: true,
        sourcemap: false,
        format: 'iife',
        platform: 'browser',
        write: false,
        logLevel: 'silent',
        target: ['es2018']
      });
      const bundled = result.outputFiles[0].text;
      const obfuscated = JavaScriptObfuscator.obfuscate(bundled, OBFUSCATOR_OPTIONS).getObfuscatedCode();
      await fse.writeFile(outAbs, obfuscated, 'utf8');
      console.log('[JS]', rel, 'bundleado+ofuscado');
    } catch (e) {
      // Si falla el bundle (por ejemplo, script muy simple sin imports), ofuscar directo
      try {
        const raw = await fse.readFile(srcAbs, 'utf8');
        const obfuscated = JavaScriptObfuscator.obfuscate(raw, OBFUSCATOR_OPTIONS).getObfuscatedCode();
        await fse.writeFile(outAbs, obfuscated, 'utf8');
        console.log('[JS]', rel, 'ofuscado sin bundle (fallback)');
      } catch (e2) {
        console.warn('[JS] Falló en', rel, e2.message);
      }
    }
  }
}

// Limpia mapas de fuente y referencias a sourceMappingURL
async function stripSourceMaps() {
  const files = glob.sync('**/*.{js,css}', { cwd: distDir, nodir: true });
  for (const rel of files) {
    const abs = path.join(distDir, rel);
    try {
      const txt = await fse.readFile(abs, 'utf8');
      const cleaned = txt
        .replace(/\/\/\# sourceMappingURL=.*$/gm, '')
        .replace(/\/\*\# sourceMappingURL=.*\*\//gm, '');
      if (cleaned !== txt) {
        await fse.writeFile(abs, cleaned, 'utf8');
        console.log('[MAP]', rel, 'referencias a sourcemap eliminadas');
      }
    } catch (e) {
      // ignore
    }
  }
}

(async () => {
  console.log('== Build seguro iniciado ==');
  await copyProject();
  await processHTML();
  await processCSS();
  await processJS();
  await stripSourceMaps();
  console.log('== Build seguro listo en /dist ==');
})();
