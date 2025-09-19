// scripts/importCleanFiles.cjs
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuración directa
const uri = 'mongodb://localhost:27017';
const dbName = 'SummonYourWill';

// Esquemas
const PartnerSchema = new mongoose.Schema({
  _id: { type: String, default: 'single' }
}, { timestamps: true, strict: false });

const VillageChiefSchema = new mongoose.Schema({
  _id: { type: String, default: 'single' }
}, { timestamps: true, strict: false });

// Modelos
const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema, 'partner');
const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema, 'villagechief');

const CLEAN_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\clean';

async function connectMongo() {
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function upsertPartner(partner) {
  await Partner.replaceOne(
    { _id: 'single' },
    { ...partner, _id: 'single' },
    { upsert: true }
  );
}

async function upsertVillageChief(doc) {
  // partnerAbilities ya fue removido en el archivo limpio
  await VillageChief.replaceOne(
    { _id: 'single' },
    { ...doc, _id: 'single' },
    { upsert: true }
  );
}

async function importCleanFile(filePath, upsertFunction, collectionName) {
  try {
    console.log(`📖 Importando ${path.basename(filePath)}...`);
    
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    await upsertFunction(jsonData);
    console.log(`✅ ${collectionName} importado exitosamente`);
    
  } catch (error) {
    console.error(`❌ Error importando ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

(async () => {
  await connectMongo();
  try {
    // Importar partner limpio
    try {
      await importCleanFile(
        path.join(CLEAN_BASE, 'partner.json'), 
        upsertPartner, 
        'Partner'
      );
    } catch (e) {
      console.log('⚠ Error con partner.json:', e.message);
    }

    // Importar villagechief limpio (sin partnerAbilities)
    try {
      await importCleanFile(
        path.join(CLEAN_BASE, 'villagechief.json'), 
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
  console.log('🎉 Importación de archivos limpios completada');
})();


