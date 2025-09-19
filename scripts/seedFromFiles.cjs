// scripts/seedFromFiles.cjs
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Configuración: permitir pasar URI por argumento o ENV
require('dotenv').config();
const uri = process.argv[2] || process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'SummonYourWill';

console.log('URI:', uri);
console.log('DB Name:', dbName);

// Esquemas (dejar que Mongo genere ObjectId por defecto)
const HeroSchema = new mongoose.Schema({
  id: Number,
  name: String,
  level: Number,
}, { timestamps: true, strict: false });

const PetSchema = new mongoose.Schema({
  name: String,
  level: Number,
}, { timestamps: true, strict: false });

const VillainSchema = new mongoose.Schema({
  name: String,
  level: Number,
}, { timestamps: true, strict: false });

const FamiliarSchema = new mongoose.Schema({
  name: String,
  level: Number,
}, { timestamps: true, strict: false });

const PartnerSchema = new mongoose.Schema({}, { timestamps: true, strict: false });

const VillageChiefSchema = new mongoose.Schema({
  id: { type: Number }
}, { timestamps: true, strict: false });

// Modelos
const Hero = mongoose.models.Hero || mongoose.model('Hero', HeroSchema, 'heroes');
const Pet = mongoose.models.Pet || mongoose.model('Pet', PetSchema, 'pets');
const Villain = mongoose.models.Villain || mongoose.model('Villain', VillainSchema, 'villains');
const Familiar = mongoose.models.Familiar || mongoose.model('Familiar', FamiliarSchema, 'familiars');
const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema, 'partner');
const PartnerAbility = mongoose.models.PartnerAbility || mongoose.model('PartnerAbility', new mongoose.Schema({ _partner_id: mongoose.Schema.Types.ObjectId, chief_id: Number, _chief_id: mongoose.Schema.Types.ObjectId }, { strict: false }), 'partner_abilities');
const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema, 'villagechief');
const VillageChiefAbility = mongoose.models.VillageChiefAbility || mongoose.model('VillageChiefAbility', new mongoose.Schema({ chief_id: Number, _chief_id: mongoose.Schema.Types.ObjectId }, { strict: false }), 'villagechief_abilities');

function resolveBase() {
  const os = require('os');
  const home = os.homedir();
  const candidates = [
    path.join(home, 'OneDrive', 'Documents', 'SummonYourWillSaves'),
    path.join(home, 'OneDrive', 'Documentos', 'SummonYourWillSaves'),
    path.join(home, 'Documents', 'SummonYourWillSaves'),
    path.join(home, 'Documentos', 'SummonYourWillSaves'),
    path.join(process.cwd(), 'SummonYourWillSaves')
  ];
  for (const c of candidates) {
    try {
      if (require('fs').existsSync(c)) {
        console.log('[Seed] Usando base:', c);
        return c;
      }
    } catch {}
  }
  const fallback = candidates[candidates.length - 1];
  console.log('[Seed] Ninguna ruta conocida existe. Usando fallback:', fallback);
  return fallback;
}

const BASE = resolveBase();

async function read(p) { 
  try {
    return JSON.parse(await fs.readFile(p, 'utf8')); 
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Archivo no encontrado: ${p}`);
    }
    throw error;
  }
}

async function readLargeFile(p) {
  try {
    const stats = await fs.stat(p);
    console.log(`Leyendo archivo ${path.basename(p)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    
    if (stats.size > 100 * 1024 * 1024) { // 100MB
      console.log(`⚠ Archivo muy grande (${(stats.size / 1024 / 1024).toFixed(2)} MB), saltando...`);
      return null;
    }
    
    // Para archivos grandes, usar readFile con buffer y luego convertir
    if (stats.size > 20 * 1024 * 1024) { // 20MB
      console.log(`📖 Leyendo archivo grande con buffer...`);
      const buffer = await fs.readFile(p);
      return JSON.parse(buffer.toString('utf8'));
    }
    
    return JSON.parse(await fs.readFile(p, 'utf8')); 
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Archivo no encontrado: ${p}`);
    }
    throw error;
  }
}

async function connectMongo() {
  if (!uri) throw new Error('MONGODB_URI no configurada');
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function upsertHeroes(heroes, chiefId, chiefObjectId) {
  if (!heroes?.length) return [];
  // Limpiar y reinsertar para generar ObjectId nuevos como en local
  await Hero.deleteMany({});
  const docs = heroes.map(h => {
    const { _id, ...rest } = h;
    // Conservar id numérico del juego para compatibilidad con repos locales
    return { ...rest, id: Number(h.id), chief_id: chiefId, _chief_id: chiefObjectId };
  });
  const inserted = await Hero.insertMany(docs);
  return inserted;
}

async function upsertPets(pets, heroIdMap, chiefId, chiefObjectId) {
  if (!pets?.length) return;
  await Pet.deleteMany({});
  const docs = pets.map(p => {
    const { _id, id, id_hero, _id_hero, ...rest } = p;
    const mappedHeroObjectId = heroIdMap.get(Number(id_hero)) || heroIdMap.get(String(id_hero)) || null;
    return {
      ...rest,
      id_hero: Number(id_hero),
      _id_hero: mappedHeroObjectId || undefined,
      chief_id: chiefId,
      _chief_id: chiefObjectId,
    };
  });
  await Pet.insertMany(docs);
}

async function upsertVillains(villains, chiefId, chiefObjectId) {
  if (!villains?.length) return;
  await Villain.deleteMany({});
  const docs = villains.map(v => {
    const { id, _id, ...rest } = v;
    return { ...rest, chief_id: chiefId, _chief_id: chiefObjectId };
  });
  await Villain.insertMany(docs);
}

async function upsertFamiliars(familiars, chiefId, chiefObjectId) {
  if (!familiars?.length) return;
  await Familiar.deleteMany({});
  const docs = familiars.map(f => {
    const { id, _id, ...rest } = f;
    return { ...rest, chief_id: chiefId, _chief_id: chiefObjectId };
  });
  await Familiar.insertMany(docs);
}

async function upsertPartner(partner) {
  // Borrar anterior para crear uno NUEVO y obtener ObjectId real
  await Partner.deleteMany({});
  const created = await Partner.create({ ...partner });
  return created && created._id;
}

async function upsertVillageChief(doc) {
  // Normalizar chiefId
  const chiefId = Number(doc.id || 1);
  let updated;
  // Usar id único para evitar duplicado por índice id_1
  const existing = await VillageChief.findOne({ id: chiefId });
  if (existing) {
    updated = await VillageChief.findOneAndUpdate(
      { id: chiefId },
      { ...doc, id: chiefId },
      { new: true }
    );
  } else {
    updated = await VillageChief.create({ ...doc, id: chiefId });
  }
  const chiefObjectId = updated && updated._id;
  // Sincronizar abilities si existen
  let abilities = Array.isArray(doc.abilities)
    ? doc.abilities
    : (typeof doc.abilities === 'object' && doc.abilities
       ? [doc.abilities]
       : (Array.isArray(doc.habilities)
           ? doc.habilities
           : (typeof doc.habilities === 'object' && doc.habilities ? [doc.habilities] : [])));
  if (!abilities || abilities.length === 0) {
    try {
      const save = await readLargeFile(path.join(BASE, 'save.json'));
      const v = save && save.villageChief ? save.villageChief : null;
      const fallback = v
        ? (Array.isArray(v.abilities) ? v.abilities
            : (typeof v.abilities === 'object' && v.abilities ? [v.abilities]
              : (Array.isArray(v.habilities) ? v.habilities
                  : (typeof v.habilities === 'object' && v.habilities ? [v.habilities] : []))))
        : [];
      if (fallback && fallback.length) abilities = fallback;
    } catch {}
  }
  if (abilities && abilities.length) {
    await VillageChiefAbility.deleteMany({ chief_id: chiefId });
    const docs = abilities.map(a => ({ ...a, chief_id: chiefId, _chief_id: chiefObjectId }));
    await VillageChiefAbility.insertMany(docs);
  }
}



(async () => {
  await connectMongo();
  try {
    // 1) Importar jefe de aldea primero (define chief_id/_chief_id)
    let chiefId, chiefObjectId;
    try {
      const vc = await readLargeFile(path.join(BASE, 'villagechief.json'));
      if (vc) {
        // Re-crear para asegurar _id: ObjectId
        const numericalId = Number(vc.id || 1);
        await VillageChief.deleteMany({});
        const created = await VillageChief.create({ ...vc, id: numericalId });
        chiefId = numericalId;
        chiefObjectId = created && created._id;
        console.log('✓ Jefe de aldea importado');
        // Importar abilities desde archivo si existe
        try {
          const abilities = await readLargeFile(path.join(BASE, 'villagechief_abilities.json'));
          if (Array.isArray(abilities) && abilities.length) {
            await VillageChiefAbility.deleteMany({ chief_id: chiefId });
            const docs = abilities.map(a => ({ ...a, chief_id: chiefId, _chief_id: chiefObjectId }));
            await VillageChiefAbility.insertMany(docs);
            console.log(`✓ Village chief abilities importadas: ${abilities.length}`);
          }
        } catch {}
      }
    } catch (e) {
      console.log('⚠ No se encontró villagechief.json o error:', e.message);
    }

    // 2) Importar héroes usando chief refs y capturar sus ObjectId
    let insertedHeroes = [];
    try {
      const heroes = await read(path.join(BASE, 'heroes.json'));
      insertedHeroes = await upsertHeroes(Array.isArray(heroes) ? heroes : heroes?.heroes ?? [], chiefId, chiefObjectId);
      console.log('✓ Héroes importados');
    } catch (e) {
      console.log('⚠ No se encontró heroes.json o error:', e.message);
    }

    // 3) Importar mascotas mapeando _id_hero a ObjectId insertado
    try {
      const pets = await read(path.join(BASE, 'pets.json'));
      const heroIdMap = new Map();
      for (const h of insertedHeroes) {
        if (typeof h.id !== 'undefined') {
          heroIdMap.set(Number(h.id), h._id);
        }
      }
      await upsertPets(Array.isArray(pets) ? pets : pets?.pets ?? [], heroIdMap, chiefId, chiefObjectId);
      console.log('✓ Mascotas importadas');
    } catch (e) {
      console.log('⚠ No se encontró pets.json o error:', e.message);
    }

    // 4) Importar villanos con refs
    try {
      const villains = await read(path.join(BASE, 'villains.json'));
      await upsertVillains(Array.isArray(villains) ? villains : villains?.villains ?? [], chiefId, chiefObjectId);
      console.log('✓ Villanos importados');
    } catch (e) {
      console.log('⚠ No se encontró villains.json o error:', e.message);
    }

    // 5) Importar familiares con refs
    try {
      const familiars = await read(path.join(BASE, 'familiars.json'));
      await upsertFamiliars(Array.isArray(familiars) ? familiars : familiars?.familiars ?? [], chiefId, chiefObjectId);
      console.log('✓ Familiares importados');
    } catch (e) {
      console.log('⚠ No se encontró familiars.json o error:', e.message);
    }

    // 6) Importar compañero y sus abilities (desde partner_abilities.json)
    try {
      const partner = await readLargeFile(path.join(BASE, 'partner.json'));
      if (partner) {
        // Normalizar y asignar refs
        const cleanPartner = { ...partner, chief_id: chiefId, _chief_id: chiefObjectId };
        const partnerObjectId = await (async () => { await Partner.deleteMany({}); const c = await Partner.create(cleanPartner); return c && c._id; })();
        console.log('✓ Compañero importado');
        // Leer abilities desde partner_abilities.json si está disponible
        try {
          const abilities = await readLargeFile(path.join(BASE, 'partner_abilities.json'));
          if (partnerObjectId && Array.isArray(abilities) && abilities.length) {
            // Determinar chiefId desde villagechief.json
            if (abilities.length >= 100) {
              await PartnerAbility.deleteMany({});
            } else {
              await PartnerAbility.deleteMany({ $or: [{ _partner_id: partnerObjectId }, { chief_id: chiefId }] });
            }
            const docs = abilities.map(a => {
              const clean = { ...a };
              delete clean._partner_id;
              delete clean._chief_id;
              return { ...clean, _partner_id: partnerObjectId, chief_id: chiefId, _chief_id: chiefObjectId };
            });
            await PartnerAbility.insertMany(docs);
            console.log(`✓ Partner abilities importadas: ${abilities.length}`);
          }
        } catch (ePA) {
          console.log('⚠ No se encontraron partner_abilities.json o error:', ePA.message);
        }
      }
    } catch (e) {
      console.log('⚠ No se encontró partner.json o error:', e.message);
    }

    // Importar jefe de aldea (y abilities desde villagechief_abilities.json)
    try {
      const vc = await readLargeFile(path.join(BASE, 'villagechief.json'));
      if (vc) {
        await upsertVillageChief(vc);
        console.log('✓ Jefe de aldea importado');
        // Abilities
        try {
          const abilities = await readLargeFile(path.join(BASE, 'villagechief_abilities.json'));
          if (Array.isArray(abilities) && abilities.length) {
            const chiefId = Number(vc.id || 1);
            const vcDoc = await VillageChief.findOne({ id: chiefId });
            const chiefObjectId2 = vcDoc && vcDoc._id;
            await VillageChiefAbility.deleteMany({ chief_id: chiefId });
            const docs = abilities.map(a => {
              const clean = { ...a };
              delete clean._chief_id;
              delete clean._partner_id;
              return { ...clean, chief_id: chiefId, _chief_id: chiefObjectId2 };
            });
            await VillageChiefAbility.insertMany(docs);
            console.log(`✓ Village chief abilities importadas: ${abilities.length}`);
          }
        } catch (eVA) {
          console.log('⚠ No se encontraron villagechief_abilities.json o error:', eVA.message);
        }
      }
    } catch (e) {
      console.log('⚠ No se encontró villagechief.json o error:', e.message);
    }

         // Save excluido de MongoDB - solo se mantiene en archivos JSON
     console.log('⚠ Save excluido de MongoDB (solo archivos JSON)');

    console.log('🎉 Seed completado exitosamente');
  } finally {
    await disconnectMongo();
  }
})();
