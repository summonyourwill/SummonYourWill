import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import pLimit from 'p-limit';
import JavaScriptObfuscator from 'javascript-obfuscator';

(async () => {
  const ROOT = process.cwd();
  const SRC_DIRS = (process.env.OBF_SRC_DIRS || 'src,app,main,renderer,preload')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const OUT_DIR = path.join(ROOT, '.obf');
  const CACHE_FILE = path.join(OUT_DIR, '.cache.json');
  const CONFIG_PATH = process.env.OBF_CONFIG || path.join(ROOT, 'obfuscator.config.json');

  await fs.ensureDir(OUT_DIR);
  const obfConfig = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));

  let cache = {};
  if (await fs.pathExists(CACHE_FILE)) {
    try { cache = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8')); } catch {}
  }

  const patterns = SRC_DIRS.map(d => `${d.replace(/\\/g, '/')}/**/*.js`);
  const files = (await fg(patterns, { ignore: ['**/node_modules/**', '**/.obf/**', '**/dist/**'] })).sort();

  const limit = pLimit(Math.max(1, Math.min(os.cpus().length, 8)));
  const start = Date.now();

  const tasks = files.map(file => limit(async () => {
    const abs = path.join(ROOT, file);
    const code = await fs.readFile(abs, 'utf8');
    const hash = crypto.createHash('sha256')
      .update(code)
      .update(JSON.stringify(obfConfig))
      .digest('hex');

    const outPath = path.join(OUT_DIR, file);
    const cached = cache[file];

    if (cached?.hash === hash && await fs.pathExists(outPath)) {
      return { file, skipped: true };
    }

    await fs.ensureDir(path.dirname(outPath));
    const result = JavaScriptObfuscator.obfuscate(code, obfConfig).getObfuscatedCode();
    await fs.writeFile(outPath, result, 'utf8');
    cache[file] = { hash };
    return { file, skipped: false };
  }));

  const results = await Promise.all(tasks);
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));

  const total = results.length;
  const skipped = results.filter(r => r.skipped).length;
  const took = Date.now() - start;
  console.log(`[obf:inc] processed=${total - skipped} skipped=${skipped} total=${total} in ${took}ms`);
})().catch(err => {
  console.error('[obf:inc] failed:', err);
  process.exit(1);
});
