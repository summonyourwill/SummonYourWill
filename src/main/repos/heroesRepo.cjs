// src/main/repos/heroesRepo.cjs
const mongoose = require('mongoose');

const HeroSchema = new mongoose.Schema({
  id: { type: Number, required: true }, // ID del juego
  chief_id: { type: Number, required: true }, // ID del village chief (numérico)
  _chief_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageChief' },
  name: String,
  level: Number,
  // MongoDB generará _id automáticamente
  // ... lo que tengas
}, { timestamps: true, strict: false });

const Hero = mongoose.models.Hero || mongoose.model('Hero', HeroSchema, 'heroes');

async function upsertHeroes(heroes) {
  if (!heroes?.length) return [];
  
  try {
    // Verificar conexión
    if (mongoose.connection.readyState !== 1) {
      console.log('[HeroesRepo] MongoDB no está conectado, saltando actualización');
      return [];
    }
    
    console.log(`[HeroesRepo] Procesando ${heroes.length} heroes...`);
    
    // Limpiar colección primero para evitar duplicados
    await Hero.deleteMany({});
    console.log('[HeroesRepo] Colección heroes limpiada');
    
    // Reemplazar toda la colección con los nuevos datos (MongoDB generará _id automáticamente)
    const insertedHeroes = await Hero.insertMany(heroes);
    console.log(`[HeroesRepo] ✅ ${heroes.length} heroes reemplazados correctamente`);
    
    // Retornar los heroes con sus ObjectId generados
    return insertedHeroes;
    
  } catch (error) {
    console.error('[HeroesRepo] Error:', error.message);
    return [];
  }
}

module.exports = {
  Hero,
  upsertHeroes
};
