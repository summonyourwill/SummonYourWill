// scripts/showVillageChiefAbilities.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function showVillageChiefAbilities() {
  try {
    console.log('🔍 Mostrando abilities de villagechief.json...');
    
    const filePath = path.join(BASE, 'villagechief.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo villagechief.json no encontrado');
      return;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    console.log('📋 Información básica:');
    console.log(`   - _id: ${jsonData._id}`);
    console.log(`   - name: ${jsonData.name}`);
    console.log(`   - level: ${jsonData.level}`);
    
    // Mostrar las primeras 5 abilities
    if (jsonData.abilities && Array.isArray(jsonData.abilities)) {
      console.log(`\n🎯 Abilities encontradas: ${jsonData.abilities.length} elementos`);
      console.log('\n📝 Primeras 5 abilities:');
      
      for (let i = 0; i < Math.min(5, jsonData.abilities.length); i++) {
        const ability = jsonData.abilities[i];
        console.log(`\n   [${i}] ${ability.name}:`);
        console.log(`       - img: "${ability.img}"`);
        console.log(`       - desc: "${ability.desc}"`);
        console.log(`       - level: ${ability.level}`);
        console.log(`       - damage: ${ability.damage}`);
        console.log(`       - healing: ${ability.healing}`);
        console.log(`       - manaCost: ${ability.manaCost}`);
        console.log(`       - cooldown: ${ability.cooldown}`);
        console.log(`       - range: ${ability.range}`);
        console.log(`       - duration: ${ability.duration}`);
        console.log(`       - criticalChance: ${ability.criticalChance}`);
        console.log(`       - criticalDamage: ${ability.criticalDamage}`);
        console.log(`       - accuracy: ${ability.accuracy}`);
        console.log(`       - evasion: ${ability.evasion}`);
        console.log(`       - effects: ${Array.isArray(ability.effects) ? `[${ability.effects.length} elementos]` : 'No es array'}`);
        console.log(`       - requirements: ${ability.requirements ? 'Presente' : 'Ausente'}`);
        
        if (ability.requirements) {
          console.log(`         - level: ${ability.requirements.level}`);
          console.log(`         - items: ${Array.isArray(ability.requirements.items) ? `[${ability.requirements.items.length} elementos]` : 'No es array'}`);
          console.log(`         - gold: ${ability.requirements.gold}`);
        }
      }
      
      // Mostrar estadísticas de todas las abilities
      console.log('\n📊 Estadísticas de abilities:');
      let withImages = 0;
      let withDescriptions = 0;
      let withDamage = 0;
      let withHealing = 0;
      
      jsonData.abilities.forEach(ability => {
        if (ability.img && ability.img !== '') withImages++;
        if (ability.desc && ability.desc !== '') withDescriptions++;
        if (ability.damage && ability.damage > 0) withDamage++;
        if (ability.healing && ability.healing > 0) withHealing++;
      });
      
      console.log(`   - Con imágenes: ${withImages}/${jsonData.abilities.length}`);
      console.log(`   - Con descripciones: ${withDescriptions}/${jsonData.abilities.length}`);
      console.log(`   - Con daño: ${withDamage}/${jsonData.abilities.length}`);
      console.log(`   - Con curación: ${withHealing}/${jsonData.abilities.length}`);
      
    } else {
      console.log('❌ No se encontraron abilities o no es un array');
      console.log(`   - Tipo: ${typeof jsonData.abilities}`);
      console.log(`   - Valor: ${jsonData.abilities}`);
    }
    
    // Verificar si hay algún problema con el archivo
    console.log('\n🔍 Verificación del archivo:');
    const fileStats = fs.statSync(filePath);
    console.log(`   - Tamaño: ${(fileStats.size / 1024).toFixed(2)} KB`);
    console.log(`   - Última modificación: ${fileStats.mtime}`);
    
  } catch (error) {
    console.error('❌ Error mostrando abilities:', error.message);
  }
}

(async () => {
  await showVillageChiefAbilities();
  console.log('\n🎉 Verificación completada');
})();

