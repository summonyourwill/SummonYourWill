// scripts/detailedVillageChiefCheck.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function detailedVillageChiefCheck() {
  try {
    console.log('🔍 Verificación detallada de villagechief.json...');
    
    const filePath = path.join(BASE, 'villagechief.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo villagechief.json no encontrado');
      return;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    console.log('📋 Verificación detallada:');
    console.log(`   - _id: ${jsonData._id}`);
    console.log(`   - name: ${jsonData.name}`);
    console.log(`   - level: ${jsonData.level}`);
    
    // Verificar abilities en detalle
    if (jsonData.abilities && Array.isArray(jsonData.abilities)) {
      console.log(`   - abilities: Array con ${jsonData.abilities.length} elementos`);
      
      if (jsonData.abilities.length > 0) {
        const firstAbility = jsonData.abilities[0];
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
    if (jsonData.stats) {
      console.log(`   - stats: Objeto presente`);
      console.log(`     - hp: ${jsonData.stats.hp}`);
      console.log(`     - maxHp: ${jsonData.stats.maxHp}`);
      console.log(`     - mana: ${jsonData.stats.mana}`);
      console.log(`     - maxMana: ${jsonData.stats.maxMana}`);
      console.log(`     - attack: ${jsonData.stats.attack}`);
      console.log(`     - defense: ${jsonData.stats.defense}`);
      console.log(`     - speed: ${jsonData.stats.speed}`);
      console.log(`     - intelligence: ${jsonData.stats.intelligence}`);
      console.log(`     - strength: ${jsonData.stats.strength}`);
      console.log(`     - agility: ${jsonData.stats.agility}`);
      console.log(`     - vitality: ${jsonData.stats.vitality}`);
      console.log(`     - wisdom: ${jsonData.stats.wisdom}`);
    } else {
      console.log('   - stats: ❌ Ausente');
    }
    
    // Verificar inventory
    if (jsonData.inventory) {
      console.log(`   - inventory: Objeto presente`);
      console.log(`     - items: ${Array.isArray(jsonData.inventory.items) ? `Array con ${jsonData.inventory.items.length} elementos` : 'No es array'}`);
      console.log(`     - gold: ${jsonData.inventory.gold}`);
      console.log(`     - gems: ${jsonData.inventory.gems}`);
    } else {
      console.log('   - inventory: ❌ Ausente');
    }
    
    // Verificar progress
    if (jsonData.progress) {
      console.log(`   - progress: Objeto presente`);
      console.log(`     - quests: ${Array.isArray(jsonData.progress.quests) ? `Array con ${jsonData.progress.quests.length} elementos` : 'No es array'}`);
      console.log(`     - achievements: ${Array.isArray(jsonData.progress.achievements) ? `Array con ${jsonData.progress.achievements.length} elementos` : 'No es array'}`);
      console.log(`     - unlockedAreas: ${Array.isArray(jsonData.progress.unlockedAreas) ? `Array con ${jsonData.progress.unlockedAreas.length} elementos` : 'No es array'}`);
    } else {
      console.log('   - progress: ❌ Ausente');
    }
    
  } catch (error) {
    console.error('❌ Error en verificación detallada:', error.message);
  }
}

(async () => {
  await detailedVillageChiefCheck();
  console.log('\n🎉 Verificación detallada completada');
})();

