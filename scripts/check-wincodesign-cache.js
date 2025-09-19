import fs from 'node:fs';

if (process.platform !== 'win32') {
  process.exit(0);
}

// electron-builder cache path moved outside of OneDrive
const cacheDir = 'C:/electron-builder-cache/winCodeSign/winCodeSign-2.6.0';

if (fs.existsSync(cacheDir)) {
  process.exit(0);
}

console.warn('[wincodesign] winCodeSign cache missing.');
console.warn('Habilita Developer Mode en Windows (Ajustes > Privacidad y seguridad > Para desarrolladores) o ejecuta la terminal como Administrador para permitir symlinks.');
console.warn('Plan B: descarga https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z');
console.warn(`y extrae el contenido en: ${cacheDir}`);
console.warn('Puedes limpiar el caché con `npm run clean:builder-cache` y reintentar.');
