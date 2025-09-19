// scripts/importCleanVillageChief.cjs
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuración directa
const uri = 'mongodb://localhost:27017';
const dbName = 'SummonYourWill';

// Esquema
const VillageChiefSchema = new mongoose.Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

// Modelo
const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema, 'villagechief');

const CLEAN_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\clean';

async function connectMongo() {
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function upsertVillageChief(doc) {
  const villageChiefId = doc._id || doc.id;
  await VillageChief.replaceOne(
    { _id: villageChiefId },
    { ...doc, _id: villageChiefId },
    { upsert: true }
  );
}

(async () => {
  await connectMongo();
  try {
    console.log('📖 Importando villagechief limpio...');
    
    const data = fs.readFileSync(path.join(CLEAN_BASE, 'villagechief.json'), 'utf8');
    const jsonData = JSON.parse(data);
    
    // Importar a MongoDB
    await upsertVillageChief(jsonData);
    
    console.log('✅ VillageChief importado exitosamente');
    console.log(`   - _id: ${jsonData._id}`);
    console.log(`   - name: ${jsonData.name}`);
    console.log(`   - abilities: ${jsonData.abilities ? jsonData.abilities.length : 0} elementos`);
    console.log(`   - partnerAbilities: ${jsonData.partnerAbilities === undefined ? '✅ Excluido' : '❌ Presente'}`);
    console.log(`   - abilities es array: ${Array.isArray(jsonData.abilities) ? '✅ Sí' : '❌ No'}`);
    
  } catch (error) {
    console.error('❌ Error importando villagechief:', error.message);
  } finally {
    await disconnectMongo();
  }
  console.log('🎉 Importación completada');
})();
