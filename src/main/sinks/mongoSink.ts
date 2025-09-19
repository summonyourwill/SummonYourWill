// src/main/sinks/mongoSink.ts
import { upsertHeroes } from '../repos/heroesRepo';
import { upsertPets } from '../repos/petsRepo';
import { upsertVillains } from '../repos/villainsRepo';
import { upsertFamiliars } from '../repos/familiarsRepo';
import { upsertPartner } from '../repos/partnerRepo';
// import { upsertVillageChief } from '../repos/villageChiefRepo'; // Usamos la versión .cjs
// import { upsertSave } from '../repos/saveRepo'; // Excluido de MongoDB

export class MongoSink {
  async write(name: string, data: any) {
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
        console.log('[MongoSink] villagechief - usando versión .cjs por ahora');
        break;
      case 'save':
        console.log(`[MongoSink] Save excluido de MongoDB - solo archivos JSON`);
        break;
      default:
        // opcional: ignorar o crear repos adicionales
        console.log(`[MongoSink] No handler for ${name}`);
        break;
    }
  }
}
