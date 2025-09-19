// src/main/repos/partnerRepo.cjs
const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  // MongoDB generará _id automáticamente
  chief_id: { type: Number, required: true }, // ID del village chief (numérico)
  _chief_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageChief' },
  name: String,
  level: Number,
  // ... lo que tengas
}, { timestamps: true, strict: false });

const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema, 'partner');

async function upsertPartner(data) {
  if (!data) return;
  
  try {
    // Verificar conexión
    if (mongoose.connection.readyState !== 1) {
      console.log('[PartnerRepo] MongoDB no está conectado, saltando actualización');
      return;
    }
    
    console.log('[PartnerRepo] Procesando partner...');
    
    // Limpiar colección primero para evitar duplicados
    await Partner.deleteMany({});
    console.log('[PartnerRepo] Colección partner limpiada');
    
    // Reemplazar toda la colección con los nuevos datos y devolver doc para obtener _id
    const created = await Partner.create(data);
    console.log('[PartnerRepo] ✅ Partner reemplazado correctamente');
    return created && created._id ? String(created._id) : null;
    
  } catch (error) {
    console.error('[PartnerRepo] Error:', error.message);
  }
}

module.exports = {
  Partner,
  upsertPartner
};