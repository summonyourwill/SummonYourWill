// src/main/watchers.ts
import chokidar from 'chokidar';
import { promises as fs } from 'fs';
import path from 'path';
import { upsertHeroes } from './repos/heroesRepo';
import { upsertPets } from './repos/petsRepo';
import { upsertVillains } from './repos/villainsRepo';
import { upsertFamiliars } from './repos/familiarsRepo';
import { upsertPartner } from './repos/partnerRepo';
// import { upsertVillageChief } from './repos/villageChiefRepo'; // Usamos la versión .cjs
// import { upsertSave } from './repos/saveRepo'; // Excluido de MongoDB

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function readJson(p: string) {
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

export function startWatchers() {
  const files = {
    heroes: path.join(BASE, 'heroes.json'),
    pets: path.join(BASE, 'pets.json'),
    villains: path.join(BASE, 'villains.json'),
    familiars: path.join(BASE, 'familiars.json'),
    partner: path.join(BASE, 'partner.json'),
    villagechief: path.join(BASE, 'villagechief.json'),
    // save: path.join(BASE, 'save.json'), // Excluido de MongoDB
  };

  Object.entries(files).forEach(([name, file]) => {
    chokidar.watch(file, { ignoreInitial: true }).on('change', async () => {
      try {
        const data = await readJson(file);
        switch (name) {
          case 'heroes': 
            await upsertHeroes(Array.isArray(data) ? data : data?.heroes ?? []); 
            break;
          case 'pets': 
            await upsertPets(Array.isArray(data) ? data : data?.pets ?? []); 
            break;
          case 'villains': 
            await upsertVillains(Array.isArray(data) ? data : data?.villains ?? []); 
            break;
          case 'familiars': 
            await upsertFamiliars(Array.isArray(data) ? data : data?.familiars ?? []); 
            break;
          case 'partner': 
            await upsertPartner(data); 
            break;
          case 'villagechief': 
            // await upsertVillageChief(data); // TODO: Implementar cuando se necesite TS
            console.log('[Watcher] villagechief - usando versión .cjs por ahora');
            break;
          // case 'save': 
          //   await upsertSave(data); 
          //   break; // Excluido de MongoDB
        }
        console.log(`[Watcher] ${name} → Mongo actualizado`);
      } catch (e) {
        console.error(`[Watcher] Error procesando ${name}:`, e);
      }
    });
  });
}
