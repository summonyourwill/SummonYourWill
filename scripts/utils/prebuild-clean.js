// scripts/utils/prebuild-clean.js
// Limpieza robusta del output en Windows para evitar EBUSY al empacar app.asar

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);

const OUTPUT_DIR = path.resolve(process.cwd(), "SYW-out", "dist");
const WIN_UNPACKED = path.join(OUTPUT_DIR, "win-unpacked");

function killIfRunning(imageName) {
  try {
    // /T derriba descendientes; /F fuerza el cierre; errores se ignoran para no romper el script
    execSync(`taskkill /IM "${imageName}" /T /F`, { stdio: "ignore" });
  } catch {}
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function rmrfWithRetry(target, attempts = 20, delay = 500) {
  for (let i = 1; i <= attempts; i++) {
    try {
      // Preferimos borrar toda la carpeta win-unpacked
      if (await fs.access(target).then(() => true).catch(() => false)) {
        await fs.rm(target, { recursive: true, force: true });
      }
      if (!(await fs.access(target).then(() => true).catch(() => false))) return;
    } catch {
      // Si es EBUSY/EPERM, reintentamos
    }
    await sleep(delay);
  }

  // Plan B: intentar rename (rompe el lock suave en algunos casos) y luego borrar
  const renamed = `${target}__pending_delete_${Date.now()}`;
  try {
    await fs.rename(target, renamed);
    await fs.rm(renamed, { recursive: true, force: true });
  } catch {
    // último intento, dejamos que el build falle con mensaje claro
    throw new Error(
      `No se pudo limpiar ${target}. Cierra el Explorador/antivirus e instancias previas de la app.`
    );
  }
}

(async () => {
  console.log("[prebuild-clean] Cerrando procesos que podrían bloquear archivos…");
  // Ajusta el nombre del exe si tu app genera otro ejecutable
  killIfRunning("SummonYourWill.exe");
  killIfRunning("electron.exe");

  console.log("[prebuild-clean] Limpiando carpeta de salida…");
  // No borres toda SYW-out/dist si quieres conservar instaladores; borrar win-unpacked es suficiente
  await rmrfWithRetry(WIN_UNPACKED);

  // Limpieza puntual del app.asar antiguo por si quedó suelto en otra ruta
  const maybeAsar = path.join(WIN_UNPACKED, "resources", "app.asar");
  if (await fs.access(maybeAsar).then(() => true).catch(() => false)) {
    await rmrfWithRetry(maybeAsar);
  }

  console.log("[prebuild-clean] OK. Listo para build.");
})().catch((e) => {
  console.error("[prebuild-clean] ERROR:", e.message || e);
  process.exit(0); // No bloqueamos el build; electron-builder volverá a intentar escribir
});
