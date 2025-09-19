// src/main/repos/villageChiefAbilitiesRepo.cjs
const mongoose = require('mongoose');

const VillageChiefAbilitySchema = new mongoose.Schema({
  chief_id: { type: Number, required: true },
  _chief_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageChief' },
  // resto de campos flexibles de cada habilidad
}, { timestamps: true, strict: false });

const VillageChiefAbility = mongoose.models.VillageChiefAbility 
  || mongoose.model('VillageChiefAbility', VillageChiefAbilitySchema, 'villagechief_abilities');

function normalizeAbilities(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === 'object') return [input];
  return [];
}

async function upsertVillageChiefAbilities(abilities, chiefId, chiefObjectId) {
  const list = normalizeAbilities(abilities);
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[VillageChiefAbilitiesRepo] MongoDB no está conectado, saltando');
      return;
    }
    console.log(`[VillageChiefAbilitiesRepo] Procesando ${list.length} abilities para chief_id=${chiefId}`);
    // Limpiar anteriores para mantener una sola versión
    await VillageChiefAbility.deleteMany({ chief_id: chiefId });
    if (list.length === 0) return;
    const docs = list.map(a => ({ ...a, chief_id: chiefId, _chief_id: chiefObjectId }));
    await VillageChiefAbility.insertMany(docs);
    console.log(`[VillageChiefAbilitiesRepo] ✅ ${docs.length} abilities insertadas`);
  } catch (error) {
    console.error('[VillageChiefAbilitiesRepo] Error:', error && error.message ? error.message : error);
  }
}

module.exports = {
  VillageChiefAbility,
  upsertVillageChiefAbilities
};


