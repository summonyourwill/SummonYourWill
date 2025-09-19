// CommonJS build of the Mongo flag utility for use from .cjs files
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');

function resolvePreferredDir() {
  const candidates = new Set();
  // 1) Electron app path si está disponible
  try {
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
      fs.accessSync(devtools);
      return base; // Encontramos la carpeta donde vive devtoolsenprod.json
    } catch {}
  }
  // Fallback a Documentos
  return path.join(os.homedir(), 'Documents', 'SummonYourWillSaves');
}

const DIR = resolvePreferredDir();
const FILE = path.join(DIR, 'mongodbconnection.json');

let cachedFlag = null;

async function ensureFile() {
  try { await fsp.mkdir(DIR, { recursive: true }); } catch {}
  try {
    await fsp.access(FILE);
  } catch {
    const initial = { mongodbConnectionEnabled: false };
    await fsp.writeFile(FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

async function loadMongoFlag() {
  if (cachedFlag !== null) return cachedFlag;
  await ensureFile();
  const raw = await fsp.readFile(FILE, 'utf-8');
  try {
    const json = JSON.parse(raw);
    cachedFlag = !!json.mongodbConnectionEnabled;
  } catch {
    cachedFlag = false;
  }
  return cachedFlag;
}

async function reloadMongoFlag() {
  cachedFlag = null;
  return loadMongoFlag();
}

module.exports = { loadMongoFlag, reloadMongoFlag, _mongoFlagPaths: { DIR, FILE } };


