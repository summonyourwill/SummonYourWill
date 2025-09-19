import fs from 'fs/promises';
import path from 'path';
import os from 'os';

function resolvePreferredDir(): string {
  const candidates = new Set<string>();
  // 1) Electron app path si está disponible (dinámico para evitar ESM/CJS issues)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { app } = require('electron');
    const appPath = app && typeof app.getAppPath === 'function' ? app.getAppPath() : null;
    if (appPath) candidates.add(appPath);
  } catch {}
  // 2) Directorio del entrypoint principal
  try {
    const mainFile = (require && require.main && require.main.filename) ? require.main.filename : null;
    if (mainFile) candidates.add(path.dirname(mainFile));
  } catch {}
  // 3) Carpeta de trabajo
  candidates.add(process.cwd());
  // 4) Tres niveles arriba desde este archivo (para entorno dev)
  candidates.add(path.resolve(__dirname, '..', '..', '..'));

  for (const base of candidates) {
    try {
      const devtools = path.join(base, 'devtoolsenprod.json');
      // use fs from 'fs/promises' via access, but here we just need sync-like; fallback with stat
      // Using access in a try/catch to detect existence
      // eslint-disable-next-line no-await-in-loop
      // Note: can't await here; switch to fs from 'fs' if needed. We'll use a quick-and-dirty check via path resolution below.
    } catch {}
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fsSync = require('fs');
      fsSync.accessSync(path.join(base, 'devtoolsenprod.json'));
      return base;
    } catch {}
  }
  return path.join(os.homedir(), 'Documents', 'SummonYourWillSaves');
}

const DIR = resolvePreferredDir();
const FILE = path.join(DIR, 'mongodbconnection.json');

type MongoFlag = { mongodbConnectionEnabled: boolean };

let cachedFlag: boolean | null = null;

async function ensureFile(): Promise<void> {
  try { await fs.mkdir(DIR, { recursive: true }); } catch {}
  try {
    await fs.access(FILE);
  } catch {
    const initial: MongoFlag = { mongodbConnectionEnabled: false };
    await fs.writeFile(FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

export async function loadMongoFlag(): Promise<boolean> {
  if (cachedFlag !== null) return cachedFlag;
  await ensureFile();
  const raw = await fs.readFile(FILE, 'utf-8');
  try {
    const json = JSON.parse(raw) as MongoFlag;
    cachedFlag = !!json.mongodbConnectionEnabled;
  } catch {
    cachedFlag = false;
  }
  return cachedFlag;
}

export async function reloadMongoFlag(): Promise<boolean> {
  cachedFlag = null;
  return loadMongoFlag();
}

export const _mongoFlagPaths = { DIR, FILE };


