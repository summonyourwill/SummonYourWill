// scripts/verifySync.cjs
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuración directa
const uri = 'mongodb://localhost:27017';
const dbName = 'SummonYourWill';

// Esquemas
const VillageChiefSchema = new mongoose.Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

const HeroSchema = new mongoose.Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

const VillainSchema = new mongoose.Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

const PetSchema = new mongoose.Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

const FamiliarSchema = new mongoose.Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

const PartnerSchema = new mongoose.Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

// Modelos
const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema, 'villagechief');
const Hero = mongoose.models.Hero || mongoose.model('Hero', HeroSchema, 'heroes');
const Villain = mongoose.models.Villain || mongoose.model('Villain', VillainSchema, 'villains');
const Pet = mongoose.models.Pet || mongoose.model('Pet', PetSchema, 'pets');
const Familiar = mongoose.models.Familiar || mongoose.model('Familiar', FamiliarSchema, 'familiars');
const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema, 'partner');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function connectMongo() {
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function verifyVillageChief() {
  const villageChief = await VillageChief.findOne({});
  if (villageChief) {
    console.log('📋 VillageChief:');
    console.log(`   - _id: ${villageChief._id}`);
    console.log(`   - name: ${villageChief.name}`);
    console.log(`   - abilities: ${villageChief.abilities ? villageChief.abilities.length : 0} elementos`);
    console.log(`   - stats: ${villageChief.stats ? '✅ Presente' : '❌ Ausente'}`);
    console.log(`   - inventory: ${villageChief.inventory ? '✅ Presente' : '❌ Ausente'}`);
    console.log(`   - progress: ${villageChief.progress ? '✅ Presente' : '❌ Ausente'}`);
    return villageChief._id;
  }
  return null;
}

async function verifyMongoSync(villageChiefId) {
  console.log('\n🔍 Verificando sincronización en MongoDB:');
  
  // Verificar heroes
  const heroSample = await Hero.findOne({});
  if (heroSample) {
    console.log(`   - Heroes: chief_id = ${heroSample.chief_id} ${heroSample.chief_id === villageChiefId ? '✅' : '❌'}`);
  }
  
  // Verificar villains
  const villainSample = await Villain.findOne({});
  if (villainSample) {
    console.log(`   - Villains: chief_id = ${villainSample.chief_id} ${villainSample.chief_id === villageChiefId ? '✅' : '❌'}`);
  }
  
  // Verificar pets
  const petSample = await Pet.findOne({});
  if (petSample) {
    console.log(`   - Pets: chief_id = ${petSample.chief_id} ${petSample.chief_id === villageChiefId ? '✅' : '❌'}`);
  }
  
  // Verificar familiars
  const familiarSample = await Familiar.findOne({});
  if (familiarSample) {
    console.log(`   - Familiars: chief_id = ${familiarSample.chief_id} ${familiarSample.chief_id === villageChiefId ? '✅' : '❌'}`);
  }
  
  // Verificar partner
  const partnerSample = await Partner.findOne({});
  if (partnerSample) {
    console.log(`   - Partner: chief_id = ${partnerSample.chief_id} ${partnerSample.chief_id === villageChiefId ? '✅' : '❌'}`);
  }
}

async function verifyJsonSync(villageChiefId) {
  console.log('\n🔍 Verificando sincronización en archivos JSON:');
  
  const files = ['heroes.json', 'villains.json', 'pets.json', 'familiars.json', 'partner.json'];
  
  for (const fileName of files) {
    const filePath = path.join(BASE, fileName);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      
      if (Array.isArray(jsonData)) {
        // Para arrays
        const sample = jsonData[0];
        if (sample && sample.chief_id) {
          console.log(`   - ${fileName}: chief_id = ${sample.chief_id} ${sample.chief_id === villageChiefId ? '✅' : '❌'}`);
        } else {
          console.log(`   - ${fileName}: chief_id = undefined ❌`);
        }
      } else {
        // Para objetos
        if (jsonData.chief_id) {
          console.log(`   - ${fileName}: chief_id = ${jsonData.chief_id} ${jsonData.chief_id === villageChiefId ? '✅' : '❌'}`);
        } else {
          console.log(`   - ${fileName}: chief_id = undefined ❌`);
        }
      }
    } else {
      console.log(`   - ${fileName}: archivo no encontrado ❌`);
    }
  }
}

async function verifyVillageChiefJson() {
  console.log('\n🔍 Verificando villagechief.json:');
  
  const filePath = path.join(BASE, 'villagechief.json');
  
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    console.log(`   - _id: ${jsonData._id}`);
    console.log(`   - name: ${jsonData.name}`);
    console.log(`   - abilities: ${jsonData.abilities ? jsonData.abilities.length : 0} elementos`);
    console.log(`   - stats: ${jsonData.stats ? '✅ Presente' : '❌ Ausente'}`);
    console.log(`   - inventory: ${jsonData.inventory ? '✅ Presente' : '❌ Ausente'}`);
    console.log(`   - progress: ${jsonData.progress ? '✅ Presente' : '❌ Ausente'}`);
    
    // Verificar estructura de abilities
    if (jsonData.abilities && jsonData.abilities.length > 0) {
      const firstAbility = jsonData.abilities[0];
      console.log(`   - abilities[0].stats: ${firstAbility.damage !== undefined ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   - abilities[0].requirements: ${firstAbility.requirements ? '✅ Presente' : '❌ Ausente'}`);
    }
  } else {
    console.log('   - villagechief.json: archivo no encontrado ❌');
  }
}

(async () => {
  await connectMongo();
  try {
    // Verificar villagechief
    const villageChiefId = await verifyVillageChief();
    
    if (villageChiefId) {
      // Verificar sincronización en MongoDB
      await verifyMongoSync(villageChiefId);
      
      // Verificar sincronización en archivos JSON
      await verifyJsonSync(villageChiefId);
      
      // Verificar villagechief.json
      await verifyVillageChiefJson();
    }
    
    console.log('\n🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
  } finally {
    await disconnectMongo();
  }
})();
