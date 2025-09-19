// scripts/importVillageChiefFixed.cjs
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

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

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

async function cleanVillageChiefData(doc) {
  // Crear una copia del documento
  const cleanedDoc = { ...doc };
  
  // Remover partnerAbilities si existe
  if (cleanedDoc.partnerAbilities !== undefined) {
    delete cleanedDoc.partnerAbilities;
    console.log('🗑️ Removido partnerAbilities de villagechief');
  }
  
  // Asegurar que abilities sea un array simple (no abilities.habilities)
  if (cleanedDoc.abilities && typeof cleanedDoc.abilities === 'object' && !Array.isArray(cleanedDoc.abilities)) {
    if (cleanedDoc.abilities.habilities && Array.isArray(cleanedDoc.abilities.habilities)) {
      cleanedDoc.abilities = cleanedDoc.abilities.habilities;
      console.log('🔄 Convertido abilities.habilities a abilities array');
    } else {
      cleanedDoc.abilities = [];
      console.log('🔄 Convertido abilities a array vacío');
    }
  }
  
  // Asegurar que abilities tenga exactamente 100 elementos
  if (!Array.isArray(cleanedDoc.abilities)) {
    cleanedDoc.abilities = [];
  }
  
  if (cleanedDoc.abilities.length < 100) {
    for (let i = cleanedDoc.abilities.length; i < 100; i++) {
      cleanedDoc.abilities.push({
        name: `No name${i + 1}`,
        img: "",
        desc: "",
        level: 1
      });
    }
    console.log(`📝 Rellenado abilities a 100 elementos`);
  } else if (cleanedDoc.abilities.length > 100) {
    cleanedDoc.abilities = cleanedDoc.abilities.slice(0, 100);
    console.log(`✂️ Truncado abilities a 100 elementos`);
  }
  
  return cleanedDoc;
}

(async () => {
  await connectMongo();
  try {
    console.log('📖 Importando villagechief corregido...');
    
    const data = fs.readFileSync(path.join(BASE, 'villagechief.json'), 'utf8');
    const jsonData = JSON.parse(data);
    
    // Limpiar datos
    const cleanedData = await cleanVillageChiefData(jsonData);
    
    // Importar a MongoDB
    await upsertVillageChief(cleanedData);
    
    console.log('✅ VillageChief importado exitosamente');
    console.log(`   - _id: ${cleanedData._id}`);
    console.log(`   - name: ${cleanedData.name}`);
    console.log(`   - abilities: ${cleanedData.abilities ? cleanedData.abilities.length : 0} elementos`);
    console.log(`   - partnerAbilities removido: ${cleanedData.partnerAbilities === undefined ? '✅ Sí' : '❌ No'}`);
    console.log(`   - abilities es array: ${Array.isArray(cleanedData.abilities) ? '✅ Sí' : '❌ No'}`);
    
  } catch (error) {
    console.error('❌ Error importando villagechief:', error.message);
  } finally {
    await disconnectMongo();
  }
  console.log('🎉 Importación completada');
})();
