const { execSync } = require('node:child_process');
const { existsSync, mkdirSync } = require('node:fs');

const cacheDir = 'C:/electron-builder-cache/winCodeSign';
const url = 'https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z';
const sevenZip = 'node_modules/7zip-bin/win/x64/7za.exe';
const pkg = `${cacheDir}/winCodeSign-2.6.0.7z`;
const out = `${cacheDir}/winCodeSign-2.6.0`;

try {
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
  if (!existsSync(pkg)) {
    execSync(`powershell -NoProfile -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${pkg}'"`, { stdio: 'inherit' });
  }
  execSync(`"${sevenZip}" x -y -bd "${pkg}" "-o${out}"`, { stdio: 'inherit' });
  console.log('winCodeSign pre-sembrado OK:', out);
} catch {
  console.error('No se pudo pre-sembrar winCodeSign. Asegúrate de DevMode/Admin y reintenta.');
  process.exit(1);
}
