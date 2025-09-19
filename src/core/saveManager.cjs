const fs = require('fs').promises;
const path = require('path');

let logger;
try {
  const candidatePaths = [
    // Ruta en desarrollo: src/core -> ../../logger.cjs
    path.resolve(__dirname, '../../logger.cjs'),
    // Ruta tras copy a build: core -> ../logger.cjs
    path.resolve(__dirname, '../logger.cjs'),
    // Ruta dentro de resources (por si se copiara allí)
    process && process.resourcesPath ? path.resolve(process.resourcesPath, 'app.asar.unpacked', 'logger.cjs') : ''
  ].filter(Boolean);

  for (const candidate of candidatePaths) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      logger = require(candidate);
      break;
    } catch (_) {}
  }
} catch (_) {}

if (!logger) {
  // Fallback: logger a consola para no romper la app si falta el archivo
  logger = {
    info: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args)
  };
}

// Función para obtener la ruta de documentos
function getDocumentsPath() {
  try {
    const { app } = require('electron');
    return app.getPath('documents');
  } catch (error) {
    // Si no estamos en Electron, usar la carpeta actual
    return process.cwd();
  }
}

// Función para obtener la ruta de userData
function getUserDataPath() {
  try {
    const { app } = require('electron');
    return app.getPath('userData');
  } catch (error) {
    // Si no estamos en Electron, usar la carpeta actual
    return process.cwd();
  }
}

const SAVE_DIR = path.join(getDocumentsPath(), 'SummonYourWillSaves');
const SAVE_FILE_PATH = path.join(SAVE_DIR, 'save.json');
const LEGACY_SAVE_PATH = path.join(getUserDataPath(), 'save.json');

// Función para generar ID único aleatorio
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Función para generar archivo heroes.json
async function generateHeroesFile(heroes, chiefId, chiefObjectId) {
  try {
    const heroesForJson = heroes.map(hero => ({
      ...hero,
      id: hero.id, // Mantener id del juego
      chief_id: chiefId, // ID numérico del village chief
      _chief_id: chiefObjectId // ObjectId del village chief en MongoDB
      // MongoDB generará _id automáticamente
    }));
    
    const heroesPath = path.join(SAVE_DIR, 'heroes.json');
    await fs.writeFile(heroesPath, JSON.stringify(heroesForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo heroes.json generado en:', heroesPath);
    
    // Sincronizar con MongoDB usando los datos con chief_id correcto
    try {
      const { upsertHeroes } = require('../main/repos/heroesRepo.cjs');
      const insertedHeroes = await upsertHeroes(heroesForJson);
      logger.info(`[MongoDB] ✅ ${heroesForJson.length} héroes sincronizados con MongoDB`);
      
      // Retornar los heroes con sus ObjectId generados
      return insertedHeroes;
    } catch (mongoError) {
      logger.warn('[MongoDB] Error sincronizando héroes:', mongoError.message);
      return heroesForJson;
    }
  } catch (error) {
    logger.error('❌ Error al generar heroes.json:', error);
    return heroes;
  }
}

// Función para generar archivo pets.json
async function generatePetsFile(heroes, chiefId, chiefObjectId) {
  try {
    const pets = [];
    
    heroes.forEach(hero => {
      if (hero.pet && hero.pet.trim() !== '') {
        pets.push({
          // MongoDB generará _id automáticamente
          id_hero: hero.id, // ID del héroe en el juego
          _id_hero: hero._id, // ObjectId del héroe en MongoDB
          chief_id: chiefId, // ID numérico del village chief
          _chief_id: chiefObjectId, // ObjectId del village chief
          name: hero.pet,
          img: hero.petImg || '',
          level: hero.petLevel || 1,
          exp: hero.petExp || 0,
          origin: hero.petOrigin || 'No origin',
          favorite: hero.petFavorite || false,
          resourceType: hero.petResourceType || null,
          pendingCount: hero.petPendingCount || 0,
          lastCollection: hero.petLastCollection || Date.now(),
          exploreDay: hero.petExploreDay || '',
          desc: hero.petDesc || ''
        });
      }
    });
    
    const petsPath = path.join(SAVE_DIR, 'pets.json');
    await fs.writeFile(petsPath, JSON.stringify(pets, null, 2), 'utf-8');
    logger.info('✅ Archivo pets.json generado en:', petsPath);
    
    // Sincronizar con MongoDB usando los datos con chief_id correcto
    try {
      const { upsertPets } = require('../main/repos/petsRepo.cjs');
      await upsertPets(pets);
      logger.info(`[MongoDB] ✅ ${pets.length} pets sincronizados con MongoDB`);
    } catch (mongoError) {
      logger.warn('[MongoDB] Error sincronizando pets:', mongoError.message);
    }
    
    return pets;
  } catch (error) {
    logger.error('❌ Error al generar pets.json:', error);
    return [];
  }
}

// Función para generar archivo villains.json
async function generateVillainsFile(villains, chiefId, chiefObjectId) {
  try {
    const villainsForJson = villains.map(villain => {
      const { id, ...villainWithoutId } = villain; // Remover id del juego
      return {
        ...villainWithoutId,
        chief_id: chiefId, // ID numérico del village chief
        _chief_id: chiefObjectId // ObjectId del village chief
        // MongoDB generará _id automáticamente
      };
    });
    
    const villainsPath = path.join(SAVE_DIR, 'villains.json');
    await fs.writeFile(villainsPath, JSON.stringify(villainsForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo villains.json generado en:', villainsPath);
    
    // Sincronizar con MongoDB usando los datos con chief_id correcto
    try {
      const { upsertVillains } = require('../main/repos/villainsRepo.cjs');
      await upsertVillains(villainsForJson);
      logger.info(`[MongoDB] ✅ ${villainsForJson.length} villains sincronizados con MongoDB`);
    } catch (mongoError) {
      logger.warn('[MongoDB] Error sincronizando villains:', mongoError.message);
    }
    
    return villainsForJson;
  } catch (error) {
    logger.error('❌ Error al generar villains.json:', error);
    return villains;
  }
}

// Función para generar archivo villagechief.json (sin abilities)
async function generateVillageChiefFile(villageChief, bossStats) {
  try {
    const villageChiefForJson = {
      ...villageChief,
      // Mantener id del juego para el esquema
      id: villageChief.id || 1,
      // MongoDB generará _id automáticamente
      // Incluir las propiedades específicas solicitadas
      nivel: villageChief.level || 1,
      experiencia: villageChief.exp || 0,
      imagen: villageChief.avatar || '',
      inventario: {
        hpPotions: villageChief.hpPotions || 0,
        manaPotions: villageChief.manaPotions || 0,
        energyPotions: villageChief.energyPotions || 0,
        expPotions: villageChief.expPotions || 0
      },
      stats: bossStats || {}
    };
    
    // Eliminar campos no deseados del objeto resultante
    delete villageChiefForJson.familiars;
    delete villageChiefForJson.habilities;
    delete villageChiefForJson.partnerAbilities;
    delete villageChiefForJson.abilities;
    
    const villageChiefPath = path.join(SAVE_DIR, 'villagechief.json');
    await fs.writeFile(villageChiefPath, JSON.stringify(villageChiefForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo villagechief.json generado en:', villageChiefPath);
    
    // Sincronizar con MongoDB y obtener el ObjectId (abilities van en archivo separado)
    let villageChiefObjectId = null;
    try {
      const { upsertVillageChief } = require('../main/repos/villageChiefRepo.cjs');
      const ids = await upsertVillageChief(villageChiefForJson);
      if (ids && ids.chiefObjectId) villageChiefObjectId = ids.chiefObjectId;
      if (ids && ids.chiefId) villageChiefForJson.id = ids.chiefId;
      logger.info('[MongoDB] ✅ Village chief sincronizado con MongoDB');
    } catch (mongoError) {
      logger.warn('[MongoDB] Error sincronizando village chief:', mongoError.message);
    }
    
    // Agregar el ObjectId al JSON para referencia
    villageChiefForJson._id = villageChiefObjectId;
    
    return villageChiefForJson;
  } catch (error) {
    logger.error('❌ Error al generar villagechief.json:', error);
    return villageChief;
  }
}

// Función para generar archivo villagechief_abilities.json
async function generateVillageChiefAbilitiesFile(villageChief, chiefId, chiefObjectId) {
  try {
    const abilitiesArray = Array.isArray(villageChief.abilities)
      ? villageChief.abilities
      : (Array.isArray(villageChief.habilities) ? villageChief.habilities : []);

    const pathOut = path.join(SAVE_DIR, 'villagechief_abilities.json');
    await fs.writeFile(pathOut, JSON.stringify(abilitiesArray, null, 2), 'utf-8');
    logger.info('✅ Archivo villagechief_abilities.json generado en:', pathOut);

    // No sincronizamos aquí; lo hará el watcher específico
    return abilitiesArray;
  } catch (error) {
    logger.error('❌ Error al generar villagechief_abilities.json:', error);
    return [];
  }
}

// Función para generar archivo partner.json (sin abilities)
async function generatePartnerFile(partner, partnerStats, chiefId, villageChief, chiefObjectId) {
  try {
    const { id, ...partnerWithoutId } = partner; // Remover id del juego
    const partnerForJson = {
      ...partnerWithoutId,
      // MongoDB generará _id automáticamente
      chief_id: chiefId, // ID numérico del village chief
      _chief_id: chiefObjectId, // ObjectId del village chief
      // Incluir las propiedades específicas solicitadas
      nivel: partner.level || 1,
      experiencia: partner.exp || 0,
      imagen: partner.img || '',
      inventario: {
        hpPotions: partner.hpPotions || 0,
        manaPotions: partner.manaPotions || 0,
        energyPotions: partner.energyPotions || 0,
        expPotions: partner.expPotions || 0
      },
      stats: partnerStats || {}
    };
    
    const partnerPath = path.join(SAVE_DIR, 'partner.json');
    await fs.writeFile(partnerPath, JSON.stringify(partnerForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo partner.json generado en:', partnerPath);
    
    // Sincronizar con MongoDB usando los datos con chief_id correcto (abilities van en archivo separado)
    try {
      const { upsertPartner } = require('../main/repos/partnerRepo.cjs');
      const partnerObjectId = await upsertPartner(partnerForJson);
      logger.info('[MongoDB] ✅ Partner sincronizado con MongoDB');
      // No sincronizamos abilities aquí; se manejarán por watcher dedicado
    } catch (mongoError) {
      logger.warn('[MongoDB] Error sincronizando partner:', mongoError.message);
    }
    
    return partnerForJson;
  } catch (error) {
    logger.error('❌ Error al generar partner.json:', error);
    return partner;
  }
}

// Función para generar archivo partner_abilities.json
async function generatePartnerAbilitiesFile(villageChief) {
  try {
    const abilities = Array.isArray(villageChief && villageChief.partnerAbilities)
      ? villageChief.partnerAbilities
      : (villageChief && typeof villageChief.partnerAbilities === 'object' && villageChief.partnerAbilities
          ? [villageChief.partnerAbilities]
          : []);
    const pathOut = path.join(SAVE_DIR, 'partner_abilities.json');
    await fs.writeFile(pathOut, JSON.stringify(abilities, null, 2), 'utf-8');
    logger.info('✅ Archivo partner_abilities.json generado en:', pathOut);
    // Sincronización diferida al watcher
    return abilities;
  } catch (error) {
    logger.error('❌ Error al generar partner_abilities.json:', error);
    return [];
  }
}

// Función para generar archivo familiars.json
async function generateFamiliarsFile(familiars, chiefId, chiefObjectId) {
  try {
    const familiarsForJson = familiars.map(familiar => {
      const { id, ...familiarWithoutId } = familiar; // Remover id del juego
      return {
        ...familiarWithoutId,
        chief_id: chiefId, // ID numérico del village chief
        _chief_id: chiefObjectId // ObjectId del village chief
        // MongoDB generará _id automáticamente
      };
    });
    
    const familiarsPath = path.join(SAVE_DIR, 'familiars.json');
    await fs.writeFile(familiarsPath, JSON.stringify(familiarsForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo familiars.json generado en:', familiarsPath);
    
    // Sincronizar con MongoDB usando los datos con chief_id correcto
    try {
      const { upsertFamiliars } = require('../main/repos/familiarsRepo.cjs');
      await upsertFamiliars(familiarsForJson);
      logger.info(`[MongoDB] ✅ ${familiarsForJson.length} familiars sincronizados con MongoDB`);
    } catch (mongoError) {
      logger.warn('[MongoDB] Error sincronizando familiars:', mongoError.message);
    }
    
    return familiarsForJson;
  } catch (error) {
    logger.error('❌ Error al generar familiars.json:', error);
    return familiars;
  }
}

async function ensureSaveDir() {
  try {
    await fs.mkdir(SAVE_DIR, { recursive: true });
  } catch (err) {
    logger.error('❌ Error creating save directory:', err);
  }
}

async function migrateLegacySave() {
  try {
    const [legacyExists, newExists] = await Promise.all([
      fs.access(LEGACY_SAVE_PATH).then(() => true).catch(() => false),
      fs.access(SAVE_FILE_PATH).then(() => true).catch(() => false)
    ]);
    if (legacyExists && !newExists) {
      await ensureSaveDir();
      await fs.copyFile(LEGACY_SAVE_PATH, SAVE_FILE_PATH);
      await fs.unlink(LEGACY_SAVE_PATH).catch(() => {});
      logger.info('📁 Migrated save file to:', SAVE_FILE_PATH);
    }
  } catch (err) {
    logger.error('❌ Error migrating save file:', err);
  }
}

// Función para verificar si MongoDB está disponible
async function isMongoDBAvailable() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1;
  } catch (error) {
    return false;
  }
}

async function saveGame(data) {
  try {
    await ensureSaveDir();
    
    // Guardar el save.json principal
    const tmpPath = SAVE_FILE_PATH + '.tmp';
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpPath, SAVE_FILE_PATH);
    logger.info('✅ Partida guardada en:', SAVE_FILE_PATH);
    
    // Verificar si MongoDB está disponible
    const mongoAvailable = await isMongoDBAvailable();
    
    if (!mongoAvailable) {
      logger.info('⚠️ MongoDB no disponible, solo generando archivos JSON...');
    }
    
    let chiefId = null;
    
    // Generar villagechief.json (sin abilities) primero para obtener el ID numérico
    if (data.villageChief) {
      const villageChiefResult = await generateVillageChiefFile(data.villageChief, data.bossStats);
      chiefId = villageChiefResult.id; // Este será el ID numérico del village chief
      var chiefObjectId = villageChiefResult._id || null;
      // Generar abilities en archivo separado
      await generateVillageChiefAbilitiesFile(data.villageChief, chiefId, chiefObjectId);
    }
    
    // Generar archivos adicionales usando el chiefId
    if (data.heroes && Array.isArray(data.heroes)) {
      const heroesWithIds = await generateHeroesFile(data.heroes, chiefId, chiefObjectId);
      
      // Generar pets.json usando los heroes con IDs
      if (data.heroes.some(h => h.pet && h.pet.trim() !== '')) {
        await generatePetsFile(heroesWithIds, chiefId, chiefObjectId);
      }
    }
    
    if (data.villains && Array.isArray(data.villains)) {
      await generateVillainsFile(data.villains, chiefId, chiefObjectId);
    }
    
    // Generar partner.json y partner_abilities.json
    if (data.partner) {
      await generatePartnerFile(data.partner, data.partnerStats, chiefId, data.villageChief, chiefObjectId);
      await generatePartnerAbilitiesFile(data.villageChief || {});
    }
    
    // Generar familiars.json
    if (data.villageChief && data.villageChief.familiars && Array.isArray(data.villageChief.familiars)) {
      await generateFamiliarsFile(data.villageChief.familiars, chiefId, chiefObjectId);
    }
    
    if (mongoAvailable) {
      logger.info('✅ Archivos JSON generados y sincronizados con MongoDB');
    } else {
      logger.info('✅ Archivos JSON generados (MongoDB no disponible)');
    }
    
  } catch (error) {
    logger.error('❌ Error al guardar partida:', error);
  }
}

async function loadGame(defaultData = {}) {
  try {
    await migrateLegacySave();
    const data = await fs.readFile(SAVE_FILE_PATH, 'utf-8');
    logger.info('✅ Partida cargada desde:', SAVE_FILE_PATH);
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn('⚠️ No se encontró una partida previa. Usando datos por defecto.');
    } else {
      logger.error('❌ Error al cargar partida:', error);
      if (error.name === 'SyntaxError') {
        try {
          const corrupt = SAVE_FILE_PATH + '.corrupt';
          await fs.rename(SAVE_FILE_PATH, corrupt);
          logger.warn('⚠️ Archivo de guardado corrupto renombrado a:', corrupt);
        } catch (renameErr) {
          logger.error('❌ Error al renombrar archivo corrupto:', renameErr);
        }
      }
    }
    return defaultData;
  }
}

async function deleteSave() {
  try {
    await fs.unlink(SAVE_FILE_PATH);
    logger.info('🗑️ Partida eliminada en:', SAVE_FILE_PATH);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.error('❌ Error al eliminar partida:', error);
    }
  }
}

module.exports = {
  saveGame,
  loadGame,
  deleteSave,
};
