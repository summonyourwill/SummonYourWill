// scripts/importWithStreams.cjs
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

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

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
  // Excluir partnerAbilities del villagechief
  const { partnerAbilities: _, ...villageChiefData } = doc;
  await VillageChief.replaceOne(
    { _id: 'single' },
    { ...villageChiefData, _id: 'single' },
    { upsert: true }
  );
}

async function importWithStream(filePath, upsertFunction, collectionName) {
  return new Promise((resolve, reject) => {
    console.log(`📖 Importando ${path.basename(filePath)} con stream...`);
    
    let data = '';
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    
    stream.on('data', (chunk) => {
      data += chunk;
    });
    
    stream.on('end', async () => {
      try {
        const jsonData = JSON.parse(data);
        await upsertFunction(jsonData);
        console.log(`✅ ${collectionName} importado exitosamente`);
        resolve();
      } catch (parseError) {
        console.error(`❌ Error parseando JSON: ${parseError.message}`);
        reject(parseError);
      }
    });
    
    stream.on('error', (err) => {
      console.error(`❌ Error leyendo archivo: ${err.message}`);
      reject(err);
    });
  });
}

(async () => {
  await connectMongo();
  try {
    // Importar partner
    try {
      await importWithStream(
        path.join(BASE, 'partner.json'), 
        upsertPartner, 
        'Partner'
      );
    } catch (e) {
      console.log('⚠ Error con partner.json:', e.message);
    }

    // Importar villagechief (sin partnerAbilities)
    try {
      await importWithStream(
        path.join(BASE, 'villagechief.json'), 
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
  console.log('🎉 Importación con streams completada');
})();


