// src/main/repos/partnerRepo.ts
import mongoose, { Schema } from 'mongoose';

const PartnerSchema = new Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

export const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema, 'partner');

export async function upsertPartner(partner: any) {
  // Para partner: usar el _id que viene en el documento (único aleatorio)
  const partnerId = partner._id || partner.id;
  await Partner.replaceOne(
    { _id: partnerId },
    { ...partner, _id: partnerId },
    { upsert: true }
  );
}
