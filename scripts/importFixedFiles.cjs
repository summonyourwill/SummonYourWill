// scripts/importFixedFiles.cjs
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuración directa
const uri = 'mongodb://localhost:27017';
const dbName = 'SummonYourWill';

// Esquemas
const PartnerSchema = new mongoose.Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

const VillageChiefSchema = new mongoose.Schema({
  _id: { type: String, default: 'single' }
}, { timestamps: true, strict: false });

// Modelos
const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema, 'partner');
const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema, 'villagechief');

const FIXED_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\fixed';

async function connectMongo() {
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function upsertPartner(partner) {
  // Usar el _id que viene en el documento (único aleatorio)
  const partnerId = partner._id || partner.id;
  await Partner.replaceOne(
    { _id: partnerId },
    { ...partner, _id: partnerId },
    { upsert: true }
  );
}

async function upsertVillageChief(doc) {
  // VillageChief mantiene _id: "single"
  await VillageChief.replaceOne(
    { _id: 'single' },
    { ...doc, _id: 'single' },
    { upsert: true }
  );
}

async function importFixedFile(filePath, upsertFunction, collectionName) {
  try {
    console.log(`📖 Importando ${path.basename(filePath)}...`);
    
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    await upsertFunction(jsonData);
    console.log(`✅ ${collectionName} importado exitosamente`);
    
    // Mostrar información del documento importado
    if (collectionName === 'Partner') {
      console.log(`   - _id: ${jsonData._id}`);
      console.log(`   - partnerAbilities: ${jsonData.partnerAbilities ? jsonData.partnerAbilities.length : 0} elementos`);
    } else if (collectionName === 'VillageChief') {
      console.log(`   - _id: ${jsonData._id}`);
      console.log(`   - abilities: ${jsonData.abilities ? jsonData.abilities.length : 0} elementos`);
      console.log(`   - abilities.habilities excluido: ${!jsonData.abilities || !jsonData.abilities.habilities ? 'Sí' : 'No'}`);
    }
    
  } catch (error) {
    console.error(`❌ Error importando ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

(async () => {
  await connectMongo();
  try {
    // Importar partner corregido (con _id único y partnerAbilities)
    try {
      await importFixedFile(
        path.join(FIXED_BASE, 'partner.json'), 
        upsertPartner, 
        'Partner'
      );
    } catch (e) {
      console.log('⚠ Error con partner.json:', e.message);
    }

    // Importar villagechief corregido (sin abilities.habilities, con abilities renombrado)
    try {
      await importFixedFile(
        path.join(FIXED_BASE, 'villagechief.json'), 
        upsertVillageChief, 
        'VillageChief'
      );
    } catch (e) {
      console.log('⚠ Error con villagechief.json:', e.message);
    }

  } catch (error) {
    console.error('Error general:', error);
  } finally {
    await disconnectMongo();
  }
  console.log('🎉 Importación de archivos corregidos completada');
})();

