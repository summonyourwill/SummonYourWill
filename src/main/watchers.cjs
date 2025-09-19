// src/main/watchers.cjs
const chokidar = require('chokidar');
const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

// Importar funciones de los repositorios
const { upsertHeroes } = require('./repos/heroesRepo.cjs');
const { upsertPets } = require('./repos/petsRepo.cjs');
const { upsertVillains } = require('./repos/villainsRepo.cjs');
const { upsertFamiliars } = require('./repos/familiarsRepo.cjs');
const { upsertPartner } = require('./repos/partnerRepo.cjs');
const { upsertPartnerAbilities } = require('./repos/partnerAbilitiesRepo.cjs');
const { upsertVillageChief } = require('./repos/villageChiefRepo.cjs');
const { upsertVillageChiefAbilities } = require('./repos/villageChiefAbilitiesRepo.cjs');

// Usar la misma ruta que saveManager.cjs (app.getPath('documents')/SummonYourWillSaves)
let BASE;
try {
  BASE = path.join(app.getPath('documents'), 'SummonYourWillSaves');
} catch (err) {
  // Fallback por si no está Electron disponible (no debería pasar en main)
  BASE = path.join(process.cwd(), 'SummonYourWillSaves');
}

async function readJson(p) {
  // Esperar un poco para asegurar que el archivo se haya escrito completamente
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Verificar que el archivo existe y no está siendo escrito
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    try {
      const raw = await fs.readFile(p, 'utf8');
      
      // Verificar que el JSON es válido
      if (raw.trim() === '') {
        throw new Error('Archivo vacío');
      }
      
      // Verificar que no termina abruptamente (archivo corrupto)
      if (!raw.trim().endsWith('}') && !raw.trim().endsWith(']')) {
        throw new Error('Archivo parece estar incompleto');
      }
      
      return JSON.parse(raw);
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error(`[Watcher] Error leyendo ${p} después de ${maxAttempts} intentos:`, error.message);
        throw error;
      }
      console.log(`[Watcher] Reintentando lectura de ${p} (intento ${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

function startWatchers() {
  console.log('[Watchers] Iniciando sistema de monitoreo de archivos...');
  
  const files = {
    heroes: path.join(BASE, 'heroes.json'),
    pets: path.join(BASE, 'pets.json'),
    villains: path.join(BASE, 'villains.json'),
    familiars: path.join(BASE, 'familiars.json'),
    partner: path.join(BASE, 'partner.json'),
    villagechief: path.join(BASE, 'villagechief.json'),
    villagechief_abilities: path.join(BASE, 'villagechief_abilities.json'),
    partner_abilities: path.join(BASE, 'partner_abilities.json'),
  };

  Object.entries(files).forEach(([name, file]) => {
    console.log(`[Watchers] Monitoreando: ${file}`);
    
    chokidar.watch(file, { ignoreInitial: true }).on('change', async () => {
      try {
        console.log(`[Watcher] Detectado cambio en ${name}.json`);
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
          case 'partner': {
            const partnerId = await upsertPartner(data);
            // abilities del partner vienen en villagechief.save -> partnerAbilities
            // No hay abilities dentro de partner.json, así que no sincronizamos aquí
            break;
          }
          case 'villagechief': {
            await upsertVillageChief(data);
            break;
          }
          case 'villagechief_abilities': {
            const abilities = Array.isArray(data)
              ? data
              : (Array.isArray(data?.abilities) ? data.abilities : (typeof data === 'object' && data ? [data] : []));
            // Obtener chiefId desde villagechief.json y _chief_id desde la BD
            try {
              const vcPath = path.join(BASE, 'villagechief.json');
              const vcJson = await readJson(vcPath).catch(() => ({}));
              const chiefId = Number(vcJson && vcJson.id ? vcJson.id : 1);
              const mongoose = require('mongoose');
              const vcColl = mongoose.connection.db.collection('villagechief');
              const vcDoc = await vcColl.findOne({ id: chiefId });
              const chiefObjectId = vcDoc && vcDoc._id ? vcDoc._id : undefined;
              if (abilities.length) {
                await upsertVillageChiefAbilities(abilities, chiefId, chiefObjectId);
              }
            } catch (e) {
              console.warn('[Watcher] Error procesando villagechief_abilities:', e && e.message ? e.message : e);
            }
            break;
          }
          case 'partner_abilities': {
            const abilities = Array.isArray(data)
              ? data
              : (Array.isArray(data?.partnerAbilities) ? data.partnerAbilities : (typeof data === 'object' && data ? [data] : []));
            try {
              const mongoose = require('mongoose');
              const partnerColl = mongoose.connection.db.collection('partner');
              const partnerDoc = await partnerColl.findOne({});
              const vcPath = path.join(BASE, 'villagechief.json');
              const vcJson = await readJson(vcPath).catch(() => ({}));
              const chiefId = Number(vcJson && vcJson.id ? vcJson.id : 1);
              const vcColl = mongoose.connection.db.collection('villagechief');
              const vcDoc = await vcColl.findOne({ id: chiefId });
              const chiefObjectId = vcDoc && vcDoc._id ? vcDoc._id : undefined;
              if (partnerDoc && partnerDoc._id && abilities.length) {
                await upsertPartnerAbilities(abilities, partnerDoc._id, chiefId, chiefObjectId);
              }
            } catch (e) {
              console.warn('[Watcher] Error procesando partner_abilities:', e && e.message ? e.message : e);
            }
            break;
          }
        }
        console.log(`[Watcher] ✅ ${name} → MongoDB actualizado`);
      } catch (e) {
        console.error(`[Watcher] ❌ Error procesando ${name}:`, e);
      }
    });
  });
  
  console.log('[Watchers] Sistema de monitoreo iniciado correctamente');
}

module.exports = {
  startWatchers
};
