// src/main/ipc.ts (registrar en app.whenReady())
import { ipcMain } from 'electron';
import { saveHeroes, savePets, saveVillains, saveFamiliars, savePartner, saveVillageChief } from './persist';
// import { saveSave } from './persist'; // Excluido de MongoDB

export function registerIpc() {
  ipcMain.handle('save:heroes', async (_evt, heroes) => {
    await saveHeroes(heroes);
    return { ok: true };
  });
  
  ipcMain.handle('save:pets', async (_evt, pets) => {
    await savePets(pets);
    return { ok: true };
  });
  
  ipcMain.handle('save:villains', async (_evt, villains) => {
    await saveVillains(villains);
    return { ok: true };
  });
  
  ipcMain.handle('save:familiars', async (_evt, familiars) => {
    await saveFamiliars(familiars);
    return { ok: true };
  });
  
  ipcMain.handle('save:partner', async (_evt, partner) => {
    await savePartner(partner);
    return { ok: true };
  });
  
  ipcMain.handle('save:villagechief', async (_evt, vc) => {
    await saveVillageChief(vc);
    return { ok: true };
  });
  
  // ipcMain.handle('save:save', async (_evt, save) => {
  //   await saveSave(save);
  //   return { ok: true };
  // }); // Excluido de MongoDB
}
