// scripts/initRemote.cjs
// Inicializa en un cluster remoto las mismas colecciones usadas localmente
// Base de datos: SummonYourWill

require('dotenv').config();
const mongoose = require('mongoose');

// Usa el URI pasado por env o por argumento. Ejemplo de uso:
//   node scripts/initRemote.cjs "mongodb+srv://..."
const argUri = process.argv[2];
const uri = argUri || process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'SummonYourWill';

if (!uri) {
  console.error('❌ Debes proporcionar el URI. Ej.: node scripts/initRemote.cjs "mongodb+srv://..."');
  process.exit(1);
}

// Definir esquemas mínimos para asegurar creación de colecciones e índices
const VillageChiefSchema = new mongoose.Schema({
  id: { type: Number, required: true },
}, { timestamps: true, strict: false });

// Índices
try { VillageChiefSchema.index({ id: 1 }, { unique: true }); } catch (_) {}

const HeroSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  chief_id: { type: Number },
  _chief_id: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true, strict: false });

const PetSchema = new mongoose.Schema({
  id_hero: { type: Number },
  _id_hero: { type: mongoose.Schema.Types.ObjectId },
  chief_id: { type: Number },
  _chief_id: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true, strict: false });

const VillainSchema = new mongoose.Schema({
  chief_id: { type: Number },
  _chief_id: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true, strict: false });

const FamiliarSchema = new mongoose.Schema({
  chief_id: { type: Number },
  _chief_id: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true, strict: false });

const PartnerSchema = new mongoose.Schema({
  chief_id: { type: Number },
  _chief_id: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true, strict: false });

const PartnerAbilitySchema = new mongoose.Schema({
  _partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: false },
  chief_id: { type: Number },
  _chief_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageChief' }
}, { timestamps: true, strict: false });

const VillageChiefAbilitySchema = new mongoose.Schema({
  chief_id: { type: Number },
  _chief_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageChief' },
}, { timestamps: true, strict: false });

// Modelos con nombre de colección explícito para asegurar los mismos nombres
const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema, 'villagechief');
const Hero = mongoose.models.Hero || mongoose.model('Hero', HeroSchema, 'heroes');
const Pet = mongoose.models.Pet || mongoose.model('Pet', PetSchema, 'pets');
const Villain = mongoose.models.Villain || mongoose.model('Villain', VillainSchema, 'villains');
const Familiar = mongoose.models.Familiar || mongoose.model('Familiar', FamiliarSchema, 'familiars');
const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema, 'partner');
const PartnerAbility = mongoose.models.PartnerAbility || mongoose.model('PartnerAbility', PartnerAbilitySchema, 'partner_abilities');
const VillageChiefAbility = mongoose.models.VillageChiefAbility || mongoose.model('VillageChiefAbility', VillageChiefAbilitySchema, 'villagechief_abilities');

async function ensureCollections() {
  // Insertar y borrar un documento mínimo en cada colección para forzar su creación
  const ops = [];
  ops.push(VillageChief.createCollection());
  ops.push(Hero.createCollection());
  ops.push(Pet.createCollection());
  ops.push(Villain.createCollection());
  ops.push(Familiar.createCollection());
  ops.push(Partner.createCollection());
  ops.push(PartnerAbility.createCollection());
  ops.push(VillageChiefAbility.createCollection());
  await Promise.allSettled(ops);

  // Asegurar índices declarados en los esquemas
  await Promise.allSettled([
    VillageChief.syncIndexes(),
    Hero.syncIndexes(),
    Pet.syncIndexes(),
    Villain.syncIndexes(),
    Familiar.syncIndexes(),
    Partner.syncIndexes(),
    PartnerAbility.syncIndexes(),
    VillageChiefAbility.syncIndexes(),
  ]);
}

async function main() {
  console.log(`[InitRemote] Conectando a ${uri}, db=${dbName} ...`);
  await mongoose.connect(uri, { dbName });
  console.log('[InitRemote] Conectado');
  await ensureCollections();
  console.log('[InitRemote] ✓ Colecciones aseguradas en la base SummonYourWill');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('[InitRemote] Error:', err && err.message ? err.message : err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});


