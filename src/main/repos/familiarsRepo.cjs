// src/main/repos/familiarsRepo.cjs
const mongoose = require('mongoose');

const FamiliarSchema = new mongoose.Schema({
  // MongoDB generará _id automáticamente
  chief_id: { type: Number, required: true }, // ID del village chief (numérico)
  _chief_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageChief' },
  name: String,
  level: Number,
  // ... lo que tengas
}, { timestamps: true, strict: false });

const Familiar = mongoose.models.Familiar || mongoose.model('Familiar', FamiliarSchema, 'familiars');

async function upsertFamiliars(data) {
  if (!data?.length) return;
  
  try {
    // Verificar conexión
    if (mongoose.connection.readyState !== 1) {
      console.log('[FamiliarsRepo] MongoDB no está conectado, saltando actualización');
      return;
    }
    
    console.log(`[FamiliarsRepo] Procesando ${data.length} familiars...`);
    
    // Limpiar colección primero para evitar duplicados
    await Familiar.deleteMany({});
    console.log('[FamiliarsRepo] Colección familiars limpiada');
    
    // Reemplazar toda la colección con los nuevos datos (MongoDB generará _id automáticamente)
    await Familiar.insertMany(data);
    console.log(`[FamiliarsRepo] ✅ ${data.length} familiars reemplazados correctamente`);
    
  } catch (error) {
    console.error('[FamiliarsRepo] Error:', error.message);
  }
}

module.exports = {
  Familiar,
  upsertFamiliars
};