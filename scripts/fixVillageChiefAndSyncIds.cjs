// scripts/fixVillageChiefAndSyncIds.cjs
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

async function getVillageChiefFromMongo() {
  const villageChief = await VillageChief.findOne({});
  return villageChief;
}

async function createCompleteVillageChiefJson(villageChiefId) {
  try {
    console.log('🔧 Creando villagechief.json completo...');
    
    // Leer el archivo actual
    const filePath = path.join(BASE, 'villagechief.json');
    const currentData = fs.readFileSync(filePath, 'utf8');
    const currentJson = JSON.parse(currentData);
    
    // Crear abilities completas con stats
    const completeAbilities = Array.from({ length: 100 }, (_, i) => ({
      name: `Ability ${i + 1}`,
      img: "",
      desc: `Descripción de la habilidad ${i + 1}`,
      level: 1,
      // Stats completos
      damage: 0,
      healing: 0,
      manaCost: 0,
      cooldown: 0,
      range: 0,
      duration: 0,
      // Stats adicionales
      criticalChance: 0,
      criticalDamage: 0,
      accuracy: 0,
      evasion: 0,
      // Efectos
      effects: [],
      // Requisitos
      requirements: {
        level: 1,
        items: [],
        gold: 0
      }
    }));
    
    // Crear objeto completo del villagechief
    const completeVillageChief = {
      _id: villageChiefId,
      name: currentJson.name || 'Fabián',
      level: currentJson.level || 1,
      exp: currentJson.exp || 0,
      nivel: currentJson.nivel || 1,
      experiencia: currentJson.experiencia || 0,
      // Stats del personaje
      stats: {
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        attack: 10,
        defense: 5,
        speed: 8,
        intelligence: 12,
        strength: 10,
        agility: 8,
        vitality: 10,
        wisdom: 12
      },
      // Potions
      hpPotions: currentJson.hpPotions || 0,
      manaPotions: currentJson.manaPotions || 0,
      expPotions: currentJson.expPotions || 0,
      energyPotions: currentJson.energyPotions || 0,
      // Abilities completas
      abilities: completeAbilities,
      // Inventario
      inventory: {
        items: [],
        gold: 0,
        gems: 0
      },
      // Progreso
      progress: {
        quests: [],
        achievements: [],
        unlockedAreas: []
      }
    };
    
    // Crear backup
    const backupPath = path.join(BASE, `villagechief.json.backup.${Date.now()}`);
    fs.writeFileSync(backupPath, currentData);
    console.log(`📦 Backup creado: ${backupPath}`);
    
    // Guardar archivo completo
    const completeJson = JSON.stringify(completeVillageChief, null, 2);
    fs.writeFileSync(filePath, completeJson, 'utf8');
    
    console.log('✅ villagechief.json completo creado');
    console.log(`   - _id: ${completeVillageChief._id}`);
    console.log(`   - name: ${completeVillageChief.name}`);
    console.log(`   - abilities: ${completeVillageChief.abilities.length} elementos con stats completos`);
    console.log(`   - stats: objeto completo con hp, mana, attack, etc.`);
    console.log(`   - inventory: objeto completo`);
    console.log(`   - progress: objeto completo`);
    
    return completeVillageChief;
    
  } catch (error) {
    console.error('❌ Error creando villagechief completo:', error.message);
    return null;
  }
}

async function syncChiefIdInMongo(villageChiefId) {
  try {
    console.log('🔄 Sincronizando chief_id en MongoDB...');
    
    // Actualizar heroes
    const heroResult = await Hero.updateMany(
      {},
      { $set: { chief_id: villageChiefId } }
    );
    console.log(`   - Heroes actualizados: ${heroResult.modifiedCount}`);
    
    // Actualizar villains
    const villainResult = await Villain.updateMany(
      {},
      { $set: { chief_id: villageChiefId } }
    );
    console.log(`   - Villains actualizados: ${villainResult.modifiedCount}`);
    
    // Actualizar pets
    const petResult = await Pet.updateMany(
      {},
      { $set: { chief_id: villageChiefId } }
    );
    console.log(`   - Pets actualizados: ${petResult.modifiedCount}`);
    
    // Actualizar familiars
    const familiarResult = await Familiar.updateMany(
      {},
      { $set: { chief_id: villageChiefId } }
    );
    console.log(`   - Familiars actualizados: ${familiarResult.modifiedCount}`);
    
    // Actualizar partner
    const partnerResult = await Partner.updateMany(
      {},
      { $set: { chief_id: villageChiefId } }
    );
    console.log(`   - Partner actualizado: ${partnerResult.modifiedCount}`);
    
    console.log('✅ Sincronización en MongoDB completada');
    
  } catch (error) {
    console.error('❌ Error sincronizando chief_id en MongoDB:', error.message);
  }
}

async function syncChiefIdInJsonFiles(villageChiefId) {
  try {
    console.log('🔄 Sincronizando chief_id en archivos JSON...');
    
    const files = ['heroes.json', 'villains.json', 'pets.json', 'familiars.json', 'partner.json'];
    
    for (const fileName of files) {
      const filePath = path.join(BASE, fileName);
      
      if (fs.existsSync(filePath)) {
        // Leer archivo
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        
        // Crear backup
        const backupPath = path.join(BASE, `${fileName}.backup.${Date.now()}`);
        fs.writeFileSync(backupPath, data);
        console.log(`   📦 Backup creado: ${backupPath}`);
        
        // Actualizar chief_id
        if (Array.isArray(jsonData)) {
          // Para arrays (heroes, villains, pets, familiars)
          jsonData.forEach(item => {
            item.chief_id = villageChiefId;
          });
        } else {
          // Para objetos (partner)
          jsonData.chief_id = villageChiefId;
        }
        
        // Guardar archivo actualizado
        const updatedJson = JSON.stringify(jsonData, null, 2);
        fs.writeFileSync(filePath, updatedJson, 'utf8');
        
        console.log(`   ✅ ${fileName} actualizado con chief_id: ${villageChiefId}`);
      } else {
        console.log(`   ⚠️ ${fileName} no encontrado`);
      }
    }
    
    console.log('✅ Sincronización en archivos JSON completada');
    
  } catch (error) {
    console.error('❌ Error sincronizando chief_id en archivos JSON:', error.message);
  }
}

(async () => {
  await connectMongo();
  try {
    // Obtener _id del villagechief
    const villageChief = await getVillageChiefFromMongo();
    if (!villageChief) {
      console.error('❌ No se encontró villagechief en MongoDB');
      return;
    }
    
    const villageChiefId = villageChief._id;
    console.log(`🆔 VillageChief ID: ${villageChiefId}`);
    
    // 1. Crear villagechief.json completo
    await createCompleteVillageChiefJson(villageChiefId);
    
    // 2. Sincronizar chief_id en MongoDB
    await syncChiefIdInMongo(villageChiefId);
    
    // 3. Sincronizar chief_id en archivos JSON
    await syncChiefIdInJsonFiles(villageChiefId);
    
    console.log('🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
  } finally {
    await disconnectMongo();
  }
})();
