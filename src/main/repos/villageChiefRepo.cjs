// src/main/repos/villageChiefRepo.cjs
const mongoose = require('mongoose');

const VillageChiefSchema = new mongoose.Schema({
  // MongoDB generará _id automáticamente
  id: { type: Number, required: true }, // ID del village chief en el juego
  name: String,
  level: Number,
  // ... lo que tengas
}, { timestamps: true, strict: false });

// Asegurar un único documento por id
try {
  VillageChiefSchema.index({ id: 1 }, { unique: true });
} catch (_) {
  // ignorar si ya existe
}

const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema, 'villagechief');

async function upsertVillageChief(doc) {
  if (!doc) return;
  
  try {
    // Verificar conexión
    if (mongoose.connection.readyState !== 1) {
      console.log('[VillageChiefRepo] MongoDB no está conectado, saltando actualización');
      return;
    }
    
    const villageChiefId = Number(doc.id || 1);
    console.log(`[VillageChiefRepo] Procesando villagechief con id=${villageChiefId} ...`);
    
    // Incluir todos los datos del JSON, solo excluir familiars que se manejan por separado
    const cleanDoc = { ...doc, id: villageChiefId };
    // Remover campos pesados
    delete cleanDoc.habilities;
    delete cleanDoc.abilities;
    delete cleanDoc.partnerAbilities;
    delete cleanDoc.familiars; // Los familiars se manejan en su propia colección
    
    // Upsert por id y devolver documento actualizado para conocer _id
    const updated = await VillageChief.findOneAndUpdate(
      { id: villageChiefId },
      cleanDoc,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('[VillageChiefRepo] ✅ Upsert realizado. _id=', String(updated && updated._id));
    
    // Actualizar chief_id en todas las otras colecciones con el ID numérico
    await updateChiefIdsInAllCollections(villageChiefId);
    
    // Retornar ambos IDs para propagar _chief_id
    return { chiefId: villageChiefId, chiefObjectId: String(updated && updated._id) };
    
  } catch (error) {
    console.error('[VillageChiefRepo] Error:', error && error.message ? error.message : error);
  }
}

async function updateChiefIdsInAllCollections(villageChiefId) {
  const collections = ['heroes', 'villains', 'pets', 'familiars', 'partner'];

  for (const collectionName of collections) {
    try {
      const collection = mongoose.connection.db.collection(collectionName);
      await collection.updateMany(
        {}, // Actualizar todos los documentos
        { $set: { chief_id: villageChiefId } } // ID numérico del village chief
      );
      console.log(`✅ Colección ${collectionName}: chief_id actualizado a ${villageChiefId}`);
    } catch (error) {
      console.error(`❌ Error actualizando chief_id en ${collectionName}:`, error);
    }
  }
}

module.exports = {
  VillageChief,
  upsertVillageChief
};
