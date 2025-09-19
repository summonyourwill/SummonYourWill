// scripts/seedFromFiles.ts (ejecútalo con ts-node o compílalo)
import { connectMongo, disconnectMongo } from '../src/main/db';
import { upsertHeroes } from '../src/main/repos/heroesRepo';
import { upsertPets } from '../src/main/repos/petsRepo';
import { upsertVillains } from '../src/main/repos/villainsRepo';
import { upsertFamiliars } from '../src/main/repos/familiarsRepo';
import { upsertPartner } from '../src/main/repos/partnerRepo';
import { upsertVillageChief } from '../src/main/repos/villageChiefRepo';
import { upsertSave } from '../src/main/repos/saveRepo';
import { promises as fs } from 'fs';
import path from 'path';

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function read(p: string) { 
  return JSON.parse(await fs.readFile(p, 'utf8')); 
}

(async () => {
  await connectMongo();
  try {
    // Importar héroes
    try {
      const heroes = await read(path.join(BASE, 'heroes.json'));
      await upsertHeroes(Array.isArray(heroes) ? heroes : heroes?.heroes ?? []);
      console.log('✓ Héroes importados');
    } catch (e) {
      console.log('⚠ No se encontró heroes.json o error:', e.message);
    }

    // Importar mascotas
    try {
      const pets = await read(path.join(BASE, 'pets.json'));
      await upsertPets(Array.isArray(pets) ? pets : pets?.pets ?? []);
      console.log('✓ Mascotas importadas');
    } catch (e) {
      console.log('⚠ No se encontró pets.json o error:', e.message);
    }

    // Importar villanos
    try {
      const villains = await read(path.join(BASE, 'villains.json'));
      await upsertVillains(Array.isArray(villains) ? villains : villains?.villains ?? []);
      console.log('✓ Villanos importados');
    } catch (e) {
      console.log('⚠ No se encontró villains.json o error:', e.message);
    }

    // Importar familiares
    try {
      const familiars = await read(path.join(BASE, 'familiars.json'));
      await upsertFamiliars(Array.isArray(familiars) ? familiars : familiars?.familiars ?? []);
      console.log('✓ Familiares importados');
    } catch (e) {
      console.log('⚠ No se encontró familiars.json o error:', e.message);
    }

    // Importar compañero
    try {
      const partner = await read(path.join(BASE, 'partner.json'));
      await upsertPartner(partner);
      console.log('✓ Compañero importado');
    } catch (e) {
      console.log('⚠ No se encontró partner.json o error:', e.message);
    }

    // Importar jefe de aldea
    try {
      const vc = await read(path.join(BASE, 'villagechief.json'));
      await upsertVillageChief(vc);
      console.log('✓ Jefe de aldea importado');
    } catch (e) {
      console.log('⚠ No se encontró villagechief.json o error:', e.message);
    }

    // Importar save
    try {
      const save = await read(path.join(BASE, 'save.json'));
      await upsertSave(save);
      console.log('✓ Save importado');
    } catch (e) {
      console.log('⚠ No se encontró save.json o error:', e.message);
    }

    console.log('🎉 Seed completado exitosamente');
  } finally {
    await disconnectMongo();
  }
})();
