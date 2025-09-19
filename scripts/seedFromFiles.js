// scripts/seedFromFiles.js
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv/config');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'SummonYourWill';

// Esquemas
const HeroSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  level: Number,
}, { timestamps: true, strict: false });

const PetSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  level: Number,
}, { timestamps: true, strict: false });

const VillainSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  level: Number,
}, { timestamps: true, strict: false });

const FamiliarSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  level: Number,
}, { timestamps: true, strict: false });

const PartnerSchema = new mongoose.Schema({
  _id: { type: String, default: 'single' }
}, { timestamps: true, strict: false });

const VillageChiefSchema = new mongoose.Schema({
  _id: { type: String, default: 'single' }
}, { timestamps: true, strict: false });

const SaveSchema = new mongoose.Schema({
  _id: { type: String, default: 'single' }
}, { timestamps: true, strict: false });

// Modelos
const Hero = mongoose.models.Hero || mongoose.model('Hero', HeroSchema);
const Pet = mongoose.models.Pet || mongoose.model('Pet', PetSchema);
const Villain = mongoose.models.Villain || mongoose.model('Villain', VillainSchema);
const Familiar = mongoose.models.Familiar || mongoose.model('Familiar', FamiliarSchema);
const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);
const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema);
const Save = mongoose.models.Save || mongoose.model('Save', SaveSchema);

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function read(p) { 
  return JSON.parse(await fs.readFile(p, 'utf8')); 
}

async function connectMongo() {
  if (!uri) throw new Error('MONGODB_URI no configurada');
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function upsertHeroes(heroes) {
  if (!heroes?.length) return;
  
  for (const hero of heroes) {
    const heroId = String(hero.id ?? hero._id);
    await Hero.replaceOne(
      { _id: heroId },
      { ...hero, _id: heroId },
      { upsert: true }
    );
  }
}

async function upsertPets(pets) {
  if (!pets?.length) return;
  
  for (const pet of pets) {
    const petId = String(pet.id ?? pet._id);
    await Pet.replaceOne(
      { _id: petId },
      { ...pet, _id: petId },
      { upsert: true }
    );
  }
}

async function upsertVillains(villains) {
  if (!villains?.length) return;
  
  for (const villain of villains) {
    const villainId = String(villain.id ?? villain._id);
    await Villain.replaceOne(
      { _id: villainId },
      { ...villain, _id: villainId },
      { upsert: true }
    );
  }
}

async function upsertFamiliars(familiars) {
  if (!familiars?.length) return;
  
  for (const familiar of familiars) {
    const familiarId = String(familiar.id ?? familiar._id);
    await Familiar.replaceOne(
      { _id: familiarId },
      { ...familiar, _id: familiarId },
      { upsert: true }
    );
  }
}

async function upsertPartner(partner) {
  await Partner.replaceOne(
    { _id: 'single' },
    { ...partner, _id: 'single' },
    { upsert: true }
  );
}

async function upsertVillageChief(doc) {
  await VillageChief.replaceOne(
    { _id: 'single' },
    { ...doc, _id: 'single' },
    { upsert: true }
  );
}

async function upsertSave(save) {
  await Save.replaceOne(
    { _id: 'single' },
    { ...save, _id: 'single' },
    { upsert: true }
  );
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
