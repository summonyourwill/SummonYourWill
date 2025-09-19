// src/main/repos/villainsRepo.cjs
const mongoose = require('mongoose');

const VillainSchema = new mongoose.Schema({
  // MongoDB generará _id automáticamente
  chief_id: { type: Number, required: true }, // ID del village chief (numérico)
  _chief_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageChief' },
  name: String,
  level: Number,
  // ... lo que tengas
}, { timestamps: true, strict: false });

const Villain = mongoose.models.Villain || mongoose.model('Villain', VillainSchema, 'villains');

async function upsertVillains(data) {
  if (!data?.length) return;
  
  try {
    // Verificar conexión
    if (mongoose.connection.readyState !== 1) {
      console.log('[VillainsRepo] MongoDB no está conectado, saltando actualización');
      return;
    }
    
    console.log(`[VillainsRepo] Procesando ${data.length} villains...`);
    
    // Limpiar colección primero para evitar duplicados
    await Villain.deleteMany({});
    console.log('[VillainsRepo] Colección villains limpiada');
    
    // Reemplazar toda la colección con los nuevos datos (MongoDB generará _id automáticamente)
    await Villain.insertMany(data);
    console.log(`[VillainsRepo] ✅ ${data.length} villains reemplazados correctamente`);
    
  } catch (error) {
    console.error('[VillainsRepo] Error:', error.message);
  }
}

module.exports = {
  Villain,
  upsertVillains
};