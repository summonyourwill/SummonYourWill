// src/main/repos/petsRepo.cjs
const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  id_hero: { type: Number, required: true }, // ID del héroe en el juego
  _id_hero: { type: mongoose.Schema.Types.ObjectId, ref: 'Hero' }, // ObjectId del héroe
  chief_id: { type: Number, required: true }, // ID del village chief (numérico)
  _chief_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageChief' },
  name: String,
  level: Number,
  // MongoDB generará _id automáticamente
  // ... lo que tengas
}, { timestamps: true, strict: false });

const Pet = mongoose.models.Pet || mongoose.model('Pet', PetSchema, 'pets');

async function upsertPets(pets) {
  if (!pets?.length) return;
  
  try {
    // Verificar conexión
    if (mongoose.connection.readyState !== 1) {
      console.log('[PetsRepo] MongoDB no está conectado, saltando actualización');
      return;
    }
    
    console.log(`[PetsRepo] Procesando ${pets.length} pets...`);
    
    // Limpiar colección primero para evitar duplicados
    await Pet.deleteMany({});
    console.log('[PetsRepo] Colección pets limpiada');
    
    // Reemplazar toda la colección con los nuevos datos (MongoDB generará _id automáticamente)
    await Pet.insertMany(pets);
    console.log(`[PetsRepo] ✅ ${pets.length} pets reemplazados correctamente`);
    
  } catch (error) {
    console.error('[PetsRepo] Error:', error.message);
  }
}

module.exports = {
  Pet,
  upsertPets
};
