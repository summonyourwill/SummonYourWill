// src/main/integration-example.ts
// Este archivo muestra cómo integrar MongoDB en tu main.cjs existente

import { connectMongo, disconnectMongo } from './db';
import { registerIpc } from './ipc';
import { startWatchers } from './watchers';

// Función para inicializar MongoDB al arrancar la app
export async function initializeMongoDB() {
  try {
    await connectMongo();
    console.log('[MongoDB] Inicializado correctamente');
    
    // Registrar los handlers de IPC
    registerIpc();
    console.log('[IPC] Handlers de MongoDB registrados');
    
    // Iniciar watchers para sincronización automática
    startWatchers();
    console.log('[Watchers] Sistema de sincronización iniciado');
    
  } catch (error) {
    console.error('[MongoDB] Error al inicializar:', error);
    // No fallar la app si MongoDB no está disponible
  }
}

// Función para cerrar MongoDB al salir de la app
export async function cleanupMongoDB() {
  try {
    await disconnectMongo();
    console.log('[MongoDB] Desconectado correctamente');
  } catch (error) {
    console.error('[MongoDB] Error al desconectar:', error);
  }
}

// INSTRUCCIONES DE INTEGRACIÓN:
// 
// 1. En tu main.cjs, agrega estas líneas al inicio:
//    const { initializeMongoDB, cleanupMongoDB } = requireFromApp('main', 'integration-example');
//
// 2. En app.whenReady(), después de crear la ventana:
//    await initializeMongoDB();
//
// 3. En app.on('before-quit'), antes de cerrar:
//    await cleanupMongoDB();
//
// 4. En tu preload.cjs, agrega las funciones de guardado:
//    contextBridge.exposeInMainWorld('SYW', {
//      // ... tus funciones existentes ...
//      saveHeroes: (heroes) => ipcRenderer.invoke('save:heroes', heroes),
//      savePets: (pets) => ipcRenderer.invoke('save:pets', pets),
//      saveVillains: (villains) => ipcRenderer.invoke('save:villains', villains),
//      saveFamiliars: (familiars) => ipcRenderer.invoke('save:familiars', familiars),
//      savePartner: (partner) => ipcRenderer.invoke('save:partner', partner),
//      saveVillageChief: (vc) => ipcRenderer.invoke('save:villagechief', vc),
//      saveSave: (save) => ipcRenderer.invoke('save:save', save),
//    });
//
// 5. En tu código del renderer, reemplaza las llamadas de guardado:
//    // Antes:
//    fs.writeFileSync('heroes.json', JSON.stringify(heroes));
//    
//    // Después:
//    window.SYW.saveHeroes(heroes);
//
//    // Para archivos únicos (partner, villagechief, save):
//    window.SYW.savePartner(partnerData);
//    window.SYW.saveVillageChief(villageChiefData);
//    window.SYW.saveSave(saveData);
