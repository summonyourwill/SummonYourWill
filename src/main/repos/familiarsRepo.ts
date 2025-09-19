// src/main/repos/familiarsRepo.ts
import mongoose, { Schema } from 'mongoose';

const FamiliarSchema = new Schema({
  _id: { type: String },        // usa tu familiar.id
  name: String,
  level: Number,
  // ... lo que tengas
}, { timestamps: true, strict: false });

export const Familiar = mongoose.models.Familiar || mongoose.model('Familiar', FamiliarSchema);

export async function upsertFamiliars(familiars: any[]) {
  if (!familiars?.length) return;
  
  // Para colecciones múltiples: iterar el array y hacer replaceOne por cada entidad usando su id como _id
  for (const familiar of familiars) {
    const familiarId = String(familiar.id ?? familiar._id);
    await Familiar.replaceOne(
      { _id: familiarId },
      { ...familiar, _id: familiarId },
      { upsert: true }
    );
  }
}
