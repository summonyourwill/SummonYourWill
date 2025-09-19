// scripts/checkMongoVillageChief.cjs
const mongoose = require('mongoose');

// Configuración directa
const uri = 'mongodb://localhost:27017';
const dbName = 'SummonYourWill';

// Esquema
const VillageChiefSchema = new mongoose.Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

// Modelo
const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema, 'villagechief');

async function connectMongo() {
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function checkMongoVillageChief() {
  try {
    console.log('🔍 Verificación detallada de villagechief en MongoDB...');
    
    const villageChief = await VillageChief.findOne({});
    
    if (!villageChief) {
      console.log('❌ No se encontró villagechief en MongoDB');
      return;
    }
    
    console.log('📋 Verificación detallada en MongoDB:');
    console.log(`   - _id: ${villageChief._id}`);
    console.log(`   - name: ${villageChief.name}`);
    console.log(`   - level: ${villageChief.level}`);
    
    // Verificar abilities en detalle
    if (villageChief.abilities && Array.isArray(villageChief.abilities)) {
      console.log(`   - abilities: Array con ${villageChief.abilities.length} elementos`);
      
      if (villageChief.abilities.length > 0) {
        const firstAbility = villageChief.abilities[0];
        console.log(`   - abilities[0]:`);
        console.log(`     - name: "${firstAbility.name}"`);
        console.log(`     - img: "${firstAbility.img}"`);
        console.log(`     - desc: "${firstAbility.desc}"`);
        console.log(`     - level: ${firstAbility.level}`);
        console.log(`     - damage: ${firstAbility.damage}`);
        console.log(`     - healing: ${firstAbility.healing}`);
        console.log(`     - manaCost: ${firstAbility.manaCost}`);
        console.log(`     - cooldown: ${firstAbility.cooldown}`);
        console.log(`     - range: ${firstAbility.range}`);
        console.log(`     - duration: ${firstAbility.duration}`);
        console.log(`     - criticalChance: ${firstAbility.criticalChance}`);
        console.log(`     - criticalDamage: ${firstAbility.criticalDamage}`);
        console.log(`     - accuracy: ${firstAbility.accuracy}`);
        console.log(`     - evasion: ${firstAbility.evasion}`);
        console.log(`     - effects: ${Array.isArray(firstAbility.effects) ? `Array con ${firstAbility.effects.length} elementos` : 'No es array'}`);
        console.log(`     - requirements: ${firstAbility.requirements ? 'Objeto presente' : 'Ausente'}`);
        
        if (firstAbility.requirements) {
          console.log(`       - requirements.level: ${firstAbility.requirements.level}`);
          console.log(`       - requirements.items: ${Array.isArray(firstAbility.requirements.items) ? `Array con ${firstAbility.requirements.items.length} elementos` : 'No es array'}`);
          console.log(`       - requirements.gold: ${firstAbility.requirements.gold}`);
        }
      }
    } else {
      console.log('   - abilities: ❌ Ausente o no es array');
    }
    
    // Verificar stats
    if (villageChief.stats) {
      console.log(`   - stats: Objeto presente`);
      console.log(`     - hp: ${villageChief.stats.hp}`);
      console.log(`     - maxHp: ${villageChief.stats.maxHp}`);
      console.log(`     - mana: ${villageChief.stats.mana}`);
      console.log(`     - maxMana: ${villageChief.stats.maxMana}`);
      console.log(`     - attack: ${villageChief.stats.attack}`);
      console.log(`     - defense: ${villageChief.stats.defense}`);
      console.log(`     - speed: ${villageChief.stats.speed}`);
      console.log(`     - intelligence: ${villageChief.stats.intelligence}`);
      console.log(`     - strength: ${villageChief.stats.strength}`);
      console.log(`     - agility: ${villageChief.stats.agility}`);
      console.log(`     - vitality: ${villageChief.stats.vitality}`);
      console.log(`     - wisdom: ${villageChief.stats.wisdom}`);
    } else {
      console.log('   - stats: ❌ Ausente');
    }
    
    // Verificar inventory
    if (villageChief.inventory) {
      console.log(`   - inventory: Objeto presente`);
      console.log(`     - items: ${Array.isArray(villageChief.inventory.items) ? `Array con ${villageChief.inventory.items.length} elementos` : 'No es array'}`);
      console.log(`     - gold: ${villageChief.inventory.gold}`);
      console.log(`     - gems: ${villageChief.inventory.gems}`);
    } else {
      console.log('   - inventory: ❌ Ausente');
    }
    
    // Verificar progress
    if (villageChief.progress) {
      console.log(`   - progress: Objeto presente`);
      console.log(`     - quests: ${Array.isArray(villageChief.progress.quests) ? `Array con ${villageChief.progress.quests.length} elementos` : 'No es array'}`);
      console.log(`     - achievements: ${Array.isArray(villageChief.progress.achievements) ? `Array con ${villageChief.progress.achievements.length} elementos` : 'No es array'}`);
      console.log(`     - unlockedAreas: ${Array.isArray(villageChief.progress.unlockedAreas) ? `Array con ${villageChief.progress.unlockedAreas.length} elementos` : 'No es array'}`);
    } else {
      console.log('   - progress: ❌ Ausente');
    }
    
  } catch (error) {
    console.error('❌ Error en verificación de MongoDB:', error.message);
  }
}

(async () => {
  await connectMongo();
  try {
    await checkMongoVillageChief();
  } finally {
    await disconnectMongo();
  }
  console.log('\n🎉 Verificación de MongoDB completada');
})();

