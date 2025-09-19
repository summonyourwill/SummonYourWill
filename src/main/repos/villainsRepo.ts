// src/main/repos/villainsRepo.ts
import mongoose, { Schema } from 'mongoose';

const VillainSchema = new Schema({
  _id: { type: String },        // usa tu villain.id
  name: String,
  level: Number,
  // ... lo que tengas
}, { timestamps: true, strict: false });

export const Villain = mongoose.models.Villain || mongoose.model('Villain', VillainSchema);

export async function upsertVillains(villains: any[]) {
  if (!villains?.length) return;
  
  // Para colecciones múltiples: iterar el array y hacer replaceOne por cada entidad usando su id como _id
  for (const villain of villains) {
    const villainId = String(villain.id ?? villain._id);
    await Villain.replaceOne(
      { _id: villainId },
      { ...villain, _id: villainId },
      { upsert: true }
    );
  }
}
