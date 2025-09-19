// scripts/importMinimalFiles.cjs
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

const MINIMAL_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\minimal';

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
  // partnerAbilities ya fue excluido en el archivo mínimo
  await VillageChief.replaceOne(
    { _id: 'single' },
    { ...doc, _id: 'single' },
    { upsert: true }
  );
}

async function importMinimalFile(filePath, upsertFunction, collectionName) {
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
    // Importar partner mínimo
    try {
      await importMinimalFile(
        path.join(MINIMAL_BASE, 'partner.json'), 
        upsertPartner, 
        'Partner'
      );
    } catch (e) {
      console.log('⚠ Error con partner.json:', e.message);
    }

    // Importar villagechief mínimo (sin partnerAbilities)
    try {
      await importMinimalFile(
        path.join(MINIMAL_BASE, 'villagechief.json'), 
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
  console.log('🎉 Importación de archivos mínimos completada');
})();


