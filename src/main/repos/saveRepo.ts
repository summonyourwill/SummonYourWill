// src/main/repos/saveRepo.ts
import mongoose, { Schema } from 'mongoose';

const SaveSchema = new Schema({
  _id: { type: String, default: 'single' }
}, { timestamps: true, strict: false });

export const Save = mongoose.models.Save || mongoose.model('Save', SaveSchema, 'save');

export async function upsertSave(save: any) {
  // Para colecciones únicas: un único replaceOne con _id: "single"
  await Save.replaceOne(
    { _id: 'single' },
    { ...save, _id: 'single' },
    { upsert: true }
  );
}
