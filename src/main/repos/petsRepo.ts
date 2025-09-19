// src/main/repos/petsRepo.ts
import mongoose, { Schema } from 'mongoose';

const PetSchema = new Schema({
  _id: { type: String },        // usa tu pet.id
  name: String,
  level: Number,
  // ... lo que tengas
}, { timestamps: true, strict: false });

export const Pet = mongoose.models.Pet || mongoose.model('Pet', PetSchema);

export async function upsertPets(pets: any[]) {
  if (!pets?.length) return;
  
  // Para colecciones múltiples: iterar el array y hacer replaceOne por cada entidad usando su id como _id
  for (const pet of pets) {
    const petId = String(pet.id ?? pet._id);
    await Pet.replaceOne(
      { _id: petId },
      { ...pet, _id: petId },
      { upsert: true }
    );
  }
}
