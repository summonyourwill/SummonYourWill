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

// Utilidades para imágenes → convertir rutas a base64 (data URL)
async function pathExists(target) {
  try { await fs.access(target); return true; } catch (_) { return false; }
}

function guessMimeByExt(filePath) {
  const ext = (path.extname(filePath) || '').toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

async function resolveImageCandidates(img, typeFolder, unitName) {
  const candidates = [];
  if (img && typeof img === 'string') {
    if (/^data:image\//i.test(img)) {
      // Ya es data URL
      return { dataUrl: img, tried: [] };
    }
    // Si es ruta relativa o absoluta
    if (path.isAbsolute(img)) {
      candidates.push(img);
    } else {
      candidates.push(path.resolve(__dirname, '../../', img));
      candidates.push(path.resolve(__dirname, '../', img));
    }
  }
  // Fallbacks por carpeta/tipo y nombre
  const baseSrcDev = path.resolve(__dirname, '../../src/Population');
  const baseSrcBuild = path.resolve(__dirname, '../Population');
  const fileNames = [];
  if (unitName) fileNames.push(`${unitName}.png`, `${unitName}.jpg`, `${unitName}.jpeg`, `${unitName}.webp`);
  // Si img venía como nombre simple
  if (img && !/[/\\]/.test(img)) {
    fileNames.push(img);
  }
  const folders = typeFolder ? [typeFolder, ''] : [''];
  for (const folder of folders) {
    for (const fname of fileNames) {
      candidates.push(path.join(baseSrcDev, folder, fname));
      candidates.push(path.join(baseSrcBuild, folder, fname));
    }
  }
  return { dataUrl: null, tried: candidates };
}

async function loadImageAsDataUrl(img, typeFolder, unitName) {
  try {
    const res = await resolveImageCandidates(img, typeFolder, unitName);
    if (res.dataUrl) return res.dataUrl; // ya era base64
    for (const candidate of res.tried) {
      if (await pathExists(candidate)) {
        const buf = await fs.readFile(candidate);
        const mime = guessMimeByExt(candidate);
        return `data:${mime};base64,${buf.toString('base64')}`;
      }
    }
  } catch (e) {
    logger && logger.warn && logger.warn('[saveManager] No se pudo convertir imagen a base64:', e.message);
  }
  return '';
}

// Función para generar archivo heroes.json
async function generateHeroesFile(heroes, chiefId) {
  try {
    const heroesForJson = heroes.map(hero => ({
      ...hero,
      id: hero.id, // Mantener id del juego
      chief_id: chiefId // ID numérico del village chief
    }));
    
    const heroesPath = path.join(SAVE_DIR, 'heroes.json');
    await fs.writeFile(heroesPath, JSON.stringify(heroesForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo heroes.json generado en:', heroesPath);
    
    return heroesForJson;
  } catch (error) {
    logger.error('❌ Error al generar heroes.json:', error);
    return heroes;
  }
}

// Función para generar archivo pets.json
async function generatePetsFile(heroes, chiefId) {
  try {
    const pets = [];
    
    heroes.forEach(hero => {
      if (hero && hero.pet && String(hero.pet).trim() !== '') {
        const {
          pet, petImg, petLevel, petExp, petOrigin, petFavorite,
          petResourceType, petPendingCount, petLastCollection,
          petExploreDay, petDesc,
          ...ownerRest
        } = hero;

        pets.push({
          id_hero: hero.id, // ID del héroe en el juego
          chief_id: chiefId, // ID numérico del village chief
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
          desc: hero.petDesc || '',
          // Embed del héroe dueño (resto de datos del héroe)
          owner_hero: ownerRest
        });
      }
    });
    
    // Si no hay mascotas, no generar archivo
    if (pets.length === 0) {
      logger.info('ℹ️ No hay mascotas para guardar. No se genera pets.json');
      return [];
    }

    const petsPath = path.join(SAVE_DIR, 'pets.json');
    await fs.writeFile(petsPath, JSON.stringify(pets, null, 2), 'utf-8');
    logger.info('✅ Archivo pets.json generado en:', petsPath);
    
    return pets;
  } catch (error) {
    logger.error('❌ Error al generar pets.json:', error);
    return [];
  }
}

// Función para generar archivo villains.json
async function generateVillainsFile(villains, chiefId) {
  try {
    const villainsForJson = villains.map(villain => {
      const { id, ...villainWithoutId } = villain; // Remover id del juego
      return {
        ...villainWithoutId,
        chief_id: chiefId // ID numérico del village chief
      };
    });
    
    const villainsPath = path.join(SAVE_DIR, 'villains.json');
    await fs.writeFile(villainsPath, JSON.stringify(villainsForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo villains.json generado en:', villainsPath);
    
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
    
    return villageChiefForJson;
  } catch (error) {
    logger.error('❌ Error al generar villagechief.json:', error);
    return villageChief;
  }
}

// Función para generar archivo villagechief_abilities.json
async function generateVillageChiefAbilitiesFile(villageChief) {
  try {
    const abilitiesArray = Array.isArray(villageChief.abilities)
      ? villageChief.abilities
      : (Array.isArray(villageChief.habilities) ? villageChief.habilities : []);

    const pathOut = path.join(SAVE_DIR, 'villagechief_abilities.json');
    await fs.writeFile(pathOut, JSON.stringify(abilitiesArray, null, 2), 'utf-8');
    logger.info('✅ Archivo villagechief_abilities.json generado en:', pathOut);

    return abilitiesArray;
  } catch (error) {
    logger.error('❌ Error al generar villagechief_abilities.json:', error);
    return [];
  }
}

// Función para generar archivo partner.json (sin abilities)
async function generatePartnerFile(partner, partnerStats, chiefId) {
  try {
    const { id, ...partnerWithoutId } = partner; // Remover id del juego
    const partnerForJson = {
      ...partnerWithoutId,
      chief_id: chiefId, // ID numérico del village chief
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
    return abilities;
  } catch (error) {
    logger.error('❌ Error al generar partner_abilities.json:', error);
    return [];
  }
}

// Función para generar archivo familiars.json
async function generateFamiliarsFile(familiars, chiefId) {
  try {
    const familiarsForJson = familiars.map(familiar => {
      const { id, ...familiarWithoutId } = familiar; // Remover id del juego
      return {
        ...familiarWithoutId,
        chief_id: chiefId // ID numérico del village chief
      };
    });
    
    const familiarsPath = path.join(SAVE_DIR, 'familiars.json');
    await fs.writeFile(familiarsPath, JSON.stringify(familiarsForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo familiars.json generado en:', familiarsPath);
    
    return familiarsForJson;
  } catch (error) {
    logger.error('❌ Error al generar familiars.json:', error);
    return familiars;
  }
}

// Función para generar archivo Elites.json
async function generateElitesFile(elites) {
  try {
    const elitesForJson = await Promise.all((Array.isArray(elites) ? elites : []).map(async elite => {
      const img64 = await loadImageAsDataUrl(elite.img, 'Elites', elite.name);
      return {
        id: elite.id ?? elite.name,
        name: elite.name,
        img: elite.img,
        img64,
        desc: elite.desc,
        level_quantity: elite.Level ?? elite.level_quantity ?? 1
      };
    }));
    
    const elitesPath = path.join(SAVE_DIR, 'Elites.json');
    await fs.writeFile(elitesPath, JSON.stringify(elitesForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo Elites.json generado en:', elitesPath);
    
    return elitesForJson;
  } catch (error) {
    logger.error('❌ Error al generar Elites.json:', error);
    return elites;
  }
}

// Función para generar archivo SpecialSoldiers.json
async function generateSpecialSoldiersFile(specialSoldiers) {
  try {
    const specialSoldiersForJson = await Promise.all((Array.isArray(specialSoldiers) ? specialSoldiers : []).map(async soldier => {
      const img64 = await loadImageAsDataUrl(soldier.img, 'SpecialSoldiers', soldier.name);
      return {
        id: soldier.id ?? soldier.name,
        name: soldier.name,
        img: soldier.img,
        img64,
        desc: soldier.desc,
        level_quantity: soldier.Quantity ?? soldier.level_quantity ?? 1
      };
    }));
    
    const specialSoldiersPath = path.join(SAVE_DIR, 'SpecialSoldiers.json');
    await fs.writeFile(specialSoldiersPath, JSON.stringify(specialSoldiersForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo SpecialSoldiers.json generado en:', specialSoldiersPath);
    
    return specialSoldiersForJson;
  } catch (error) {
    logger.error('❌ Error al generar SpecialSoldiers.json:', error);
    return specialSoldiers;
  }
}

// Función para generar archivo SpecialCitizens.json
async function generateSpecialCitizensFile(specialCitizens) {
  try {
    const specialCitizensForJson = await Promise.all((Array.isArray(specialCitizens) ? specialCitizens : []).map(async citizen => {
      const img64 = await loadImageAsDataUrl(citizen.img, 'SpecialCitizens', citizen.name);
      return {
        id: citizen.id ?? citizen.name,
        name: citizen.name,
        img: citizen.img,
        img64,
        desc: citizen.desc,
        level_quantity: citizen.Quantity ?? citizen.level_quantity ?? 1
      };
    }));
    
    const specialCitizensPath = path.join(SAVE_DIR, 'SpecialCitizens.json');
    await fs.writeFile(specialCitizensPath, JSON.stringify(specialCitizensForJson, null, 2), 'utf-8');
    logger.info('✅ Archivo SpecialCitizens.json generado en:', specialCitizensPath);
    
    return specialCitizensForJson;
  } catch (error) {
    logger.error('❌ Error al generar SpecialCitizens.json:', error);
    return specialCitizens;
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


async function saveGame(data) {
  try {
    await ensureSaveDir();
    
    // Guardar el save.json principal
    const tmpPath = SAVE_FILE_PATH + '.tmp';
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpPath, SAVE_FILE_PATH);
    logger.info('✅ Partida guardada en:', SAVE_FILE_PATH);
    
    let chiefId = null;
    
    // Generar villagechief.json (sin abilities) primero para obtener el ID numérico
    if (data.villageChief) {
      const villageChiefResult = await generateVillageChiefFile(data.villageChief, data.bossStats);
      chiefId = villageChiefResult.id; // Este será el ID numérico del village chief
      // Generar abilities en archivo separado
      await generateVillageChiefAbilitiesFile(data.villageChief);
    }
    
    // Generar archivos adicionales usando el chiefId
    if (data.heroes && Array.isArray(data.heroes)) {
      await generateHeroesFile(data.heroes, chiefId);

      // Generar pets.json solo si hay héroes con mascota
      if (data.heroes.some(h => h && h.pet && String(h.pet).trim() !== '')) {
        await generatePetsFile(data.heroes, chiefId);
      }
    }
    
    if (data.villains && Array.isArray(data.villains)) {
      await generateVillainsFile(data.villains, chiefId);
    }
    
    // Generar partner.json y partner_abilities.json
    if (data.partner) {
      await generatePartnerFile(data.partner, data.partnerStats, chiefId);
      await generatePartnerAbilitiesFile(data.villageChief || {});
    }
    
    // Generar familiars.json
    if (data.villageChief && data.villageChief.familiars && Array.isArray(data.villageChief.familiars)) {
      await generateFamiliarsFile(data.villageChief.familiars, chiefId);
    }
    
    // Generar Elites.json
    if (data.Elites && Array.isArray(data.Elites)) {
      await generateElitesFile(data.Elites);
    }
    
    // Generar SpecialSoldiers.json
    if (data.SpecialSoldiers && Array.isArray(data.SpecialSoldiers)) {
      await generateSpecialSoldiersFile(data.SpecialSoldiers);
    }
    
    // Generar SpecialCitizens.json
    if (data.SpecialCitizens && Array.isArray(data.SpecialCitizens)) {
      await generateSpecialCitizensFile(data.SpecialCitizens);
    }
    
    logger.info('✅ Archivos JSON generados correctamente');
    
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
      logger.warn('⚠️ No se encontró save.json. Intentando cargar partida0.json como respaldo...');
      
      // Intentar cargar partida0.json como respaldo
      try {
        const partida0Path = path.join(__dirname, '../../partida0.json');
        const backupData = await fs.readFile(partida0Path, 'utf-8');
        logger.info('✅ Partida de respaldo cargada desde:', partida0Path);
        return JSON.parse(backupData);
      } catch (backupError) {
        logger.warn('⚠️ No se pudo cargar partida0.json. Usando datos por defecto.');
        logger.error('Error al cargar partida0.json:', backupError);
        return defaultData;
      }
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
      
      // Si hay error de sintaxis, también intentar cargar partida0.json
      try {
        const partida0Path = path.join(__dirname, '../../partida0.json');
        const backupData = await fs.readFile(partida0Path, 'utf-8');
        logger.info('✅ Cargando partida0.json como respaldo tras error de sintaxis');
        return JSON.parse(backupData);
      } catch (backupError) {
        logger.warn('⚠️ No se pudo cargar partida0.json como respaldo. Usando datos por defecto.');
        return defaultData;
      }
    }
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

async function resetToPartida0() {
  try {
    // Leer el contenido de partida0.json
    const partida0Path = path.join(__dirname, '../../partida0.json');
    const partida0Content = await fs.readFile(partida0Path, 'utf-8');
    const partida0Data = JSON.parse(partida0Content);
    
    // Guardar esos datos en save.json usando la función saveGame existente
    await saveGame(partida0Data);
    logger.info('🔄 Reset completado: partida0.json copiado a save.json');
    return true;
  } catch (error) {
    logger.error('❌ Error al resetear a partida0:', error);
    return false;
  }
}

module.exports = {
  saveGame,
  loadGame,
  deleteSave,
  resetToPartida0,
};
