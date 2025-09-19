// scripts/importLargeFiles.cjs
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

const SaveSchema = new mongoose.Schema({
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

async function importWithStream(filePath, model, collectionName) {
  return new Promise((resolve, reject) => {
    const stats = fs.statSync(filePath);
    console.log(`📖 Importando ${path.basename(filePath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB) usando stream...`);
    
    let data = '';
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    
    stream.on('data', (chunk) => {
      data += chunk;
    });
    
    stream.on('end', async () => {
      try {
        const jsonData = JSON.parse(data);
        await model.replaceOne(
          { _id: 'single' },
          { ...jsonData, _id: 'single' },
          { upsert: true }
        );
        console.log(`✓ ${collectionName} importado exitosamente`);
        resolve();
      } catch (error) {
        console.error(`❌ Error importando ${collectionName}:`, error.message);
        reject(error);
      }
    });
    
    stream.on('error', (error) => {
      console.error(`❌ Error leyendo archivo ${path.basename(filePath)}:`, error.message);
      reject(error);
    });
  });
}

async function importLargeFiles() {
  try {
    // Importar partner.json
    try {
      await importWithStream(path.join(BASE, 'partner.json'), Partner, 'Partner');
    } catch (e) {
      console.log('⚠ Error con partner.json:', e.message);
    }

    // Importar villagechief.json (solo si es menor a 200MB)
    try {
      const vcStats = fs.statSync(path.join(BASE, 'villagechief.json'));
      if (vcStats.size < 200 * 1024 * 1024) {
        await importWithStream(path.join(BASE, 'villagechief.json'), VillageChief, 'VillageChief');
      } else {
        console.log('⚠ villagechief.json muy grande, saltando...');
      }
    } catch (e) {
      console.log('⚠ Error con villagechief.json:', e.message);
    }

         // Save excluido de MongoDB - solo se mantiene en archivos JSON
     console.log('⚠ Save excluido de MongoDB (solo archivos JSON)');

  } catch (error) {
    console.error('Error general:', error);
  }
}

(async () => {
  await connectMongo();
  try {
    await importLargeFiles();
    console.log('🎉 Importación de archivos grandes completada');
  } finally {
    await disconnectMongo();
  }
})();

