// src/main/repos/heroesRepo.ts
import mongoose, { Schema } from 'mongoose';

const HeroSchema = new Schema({
  _id: { type: String },        // usa tu hero.id
  name: String,
  level: Number,
  // ... lo que tengas
}, { timestamps: true, strict: false });

export const Hero = mongoose.models.Hero || mongoose.model('Hero', HeroSchema, 'heroes');

export async function upsertHeroes(heroes: any[]) {
  if (!heroes?.length) return;
  
  // Para colecciones múltiples: iterar el array y hacer replaceOne por cada entidad usando su id como _id
  for (const hero of heroes) {
    const heroId = String(hero.id ?? hero._id);
    await Hero.replaceOne(
      { _id: heroId },
      { ...hero, _id: heroId },
      { upsert: true }
    );
  }
}
