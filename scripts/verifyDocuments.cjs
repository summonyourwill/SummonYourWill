// scripts/verifyDocuments.cjs
const mongoose = require('mongoose');

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

async function connectMongo() {
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function verifyDocuments() {
  try {
    console.log('🔍 Verificando documentos...\n');
    
    // Verificar Partner
    const partner = await Partner.findOne();
    if (partner) {
      console.log('📋 Partner:');
      console.log(`   - _id: ${partner._id}`);
      console.log(`   - name: ${partner.name}`);
      console.log(`   - level: ${partner.level}`);
      console.log(`   - partnerAbilities: ${partner.partnerAbilities ? partner.partnerAbilities.length : 0} elementos`);
      console.log(`   - _id es único: ${partner._id !== 'single' ? '✅ Sí' : '❌ No'}`);
    } else {
      console.log('❌ No se encontró documento Partner');
    }
    
    console.log('');
    
    // Verificar VillageChief
    const villageChief = await VillageChief.findOne();
    if (villageChief) {
      console.log('📋 VillageChief:');
      console.log(`   - _id: ${villageChief._id}`);
      console.log(`   - name: ${villageChief.name}`);
      console.log(`   - level: ${villageChief.level}`);
      console.log(`   - abilities: ${villageChief.abilities ? villageChief.abilities.length : 0} elementos`);
      console.log(`   - abilities.habilities excluido: ${!villageChief.abilities || !villageChief.abilities.habilities ? '✅ Sí' : '❌ No'}`);
      console.log(`   - _id es "single": ${villageChief._id === 'single' ? '✅ Sí' : '❌ No'}`);
    } else {
      console.log('❌ No se encontró documento VillageChief');
    }
    
  } catch (error) {
    console.error('❌ Error verificando documentos:', error.message);
  }
}

(async () => {
  await connectMongo();
  try {
    await verifyDocuments();
  } finally {
    await disconnectMongo();
  }
  console.log('\n🎉 Verificación completada');
})();

