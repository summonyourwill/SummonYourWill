// src/main/repos/partnerAbilitiesRepo.cjs
const mongoose = require('mongoose');

const PartnerAbilitySchema = new mongoose.Schema({
  _partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  chief_id: { type: Number },
  _chief_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageChief' }
}, { timestamps: true, strict: false });

const PartnerAbility = mongoose.models.PartnerAbility
  || mongoose.model('PartnerAbility', PartnerAbilitySchema, 'partner_abilities');

function normalizeAbilities(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === 'object') return [input];
  return [];
}

async function upsertPartnerAbilities(abilities, partnerObjectId, chiefId, chiefObjectId) {
  const list = normalizeAbilities(abilities);
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[PartnerAbilitiesRepo] MongoDB no está conectado, saltando');
      return;
    }
    console.log(`[PartnerAbilitiesRepo] Procesando ${list.length} abilities para _partner_id=${partnerObjectId}`);
    // Si es un set completo (100), limpiar toda la colección para evitar duplicados históricos
    if (list.length >= 100) {
      await PartnerAbility.deleteMany({});
    } else {
      // Limpiar anteriores por _partner_id o chief_id (por si cambió el ObjectId de partner)
      await PartnerAbility.deleteMany({ $or: [{ _partner_id: partnerObjectId }, { chief_id: chiefId }] });
    }
    if (list.length === 0) return;
    const docs = list.map(a => ({ ...a, _partner_id: partnerObjectId, chief_id: chiefId, _chief_id: chiefObjectId }));
    await PartnerAbility.insertMany(docs);
    console.log(`[PartnerAbilitiesRepo] ✅ ${docs.length} partner abilities insertadas`);
  } catch (error) {
    console.error('[PartnerAbilitiesRepo] Error:', error && error.message ? error.message : error);
  }
}

module.exports = {
  PartnerAbility,
  upsertPartnerAbilities
};


