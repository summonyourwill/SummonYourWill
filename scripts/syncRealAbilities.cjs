// scripts/syncRealAbilities.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function syncRealAbilities() {
  try {
    console.log('🔄 Sincronizando abilities reales del juego...');
    
    const filePath = path.join(BASE, 'villagechief.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo villagechief.json no encontrado');
      return;
    }
    
    // Leer el archivo actual
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    console.log('📋 Información actual:');
    console.log(`   - _id: ${jsonData._id}`);
    console.log(`   - name: ${jsonData.name}`);
    console.log(`   - abilities: ${jsonData.abilities ? jsonData.abilities.length : 0} elementos`);
    console.log(`   - habilities: ${jsonData.habilities ? jsonData.habilities.length : 0} elementos`);
    
    // Si hay habilities (abilities reales del juego), usarlas
    if (jsonData.habilities && Array.isArray(jsonData.habilities) && jsonData.habilities.length > 0) {
      console.log('🎯 Encontradas habilities reales del juego, sincronizando...');
      
      // Convertir habilities a abilities con la estructura correcta
      const realAbilities = jsonData.habilities.map((hability, index) => ({
        name: hability.name || `Ability ${index + 1}`,
        img: hability.img || '',
        level: hability.level || 1,
        desc: hability.desc || '',
        damage: hability.damage || 0,
        healing: hability.healing || 0,
        manaCost: hability.manaCost || 0,
        cooldown: hability.cooldown || 0,
        range: hability.range || 0,
        duration: hability.duration || 0,
        criticalChance: hability.criticalChance || 0,
        criticalDamage: hability.criticalDamage || 0,
        accuracy: hability.accuracy || 0,
        evasion: hability.evasion || 0,
        effects: hability.effects || [],
        requirements: hability.requirements || {
          level: 1,
          items: [],
          gold: 0
        },
        modified: hability.modified || Date.now(),
        firstModified: hability.firstModified || hability.modified || Date.now(),
        number: hability.number || index + 1,
        stepImgs: hability.stepImgs || [],
        activeStep: hability.activeStep || 0,
        imgOffset: hability.imgOffset || 50,
        imgOffsetX: hability.imgOffsetX || 50
      }));
      
      // Asegurar que tenemos exactamente 100 abilities
      while (realAbilities.length < 100) {
        const index = realAbilities.length;
        realAbilities.push({
          name: `Ability ${index + 1}`,
          img: '',
          level: 1,
          desc: '',
          damage: 0,
          healing: 0,
          manaCost: 0,
          cooldown: 0,
          range: 0,
          duration: 0,
          criticalChance: 0,
          criticalDamage: 0,
          accuracy: 0,
          evasion: 0,
          effects: [],
          requirements: {
            level: 1,
            items: [],
            gold: 0
          },
          modified: Date.now(),
          firstModified: Date.now(),
          number: index + 1,
          stepImgs: [],
          activeStep: 0,
          imgOffset: 50,
          imgOffsetX: 50
        });
      }
      
      // Actualizar el JSON
      jsonData.abilities = realAbilities;
      
      // Remover habilities duplicadas si existen
      if (jsonData.habilities) {
        delete jsonData.habilities;
      }
      
      // Remover partnerAbilities si existen
      if (jsonData.partnerAbilities) {
        delete jsonData.partnerAbilities;
      }
      
      console.log(`✅ Sincronizadas ${realAbilities.length} abilities reales`);
      
    } else {
      console.log('⚠️ No se encontraron habilities reales, manteniendo abilities actuales');
    }
    
    // Asegurar que tenemos stats
    if (!jsonData.stats) {
      jsonData.stats = {
        fuerza: 1,
        suerte: 1,
        inteligencia: 1,
        destreza: 1,
        defensa: 1,
        vida: 1,
        mana: 1
      };
      console.log('✅ Agregados stats por defecto');
    }
    
    // Guardar el archivo actualizado
    const updatedData = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync(filePath, updatedData, 'utf8');
    
    console.log('💾 Archivo villagechief.json actualizado');
    console.log(`📊 Total de abilities: ${jsonData.abilities.length}`);
    
    // Mostrar algunas abilities de ejemplo
    if (jsonData.abilities && jsonData.abilities.length > 0) {
      console.log('\n📝 Primeras 3 abilities:');
      for (let i = 0; i < Math.min(3, jsonData.abilities.length); i++) {
        const ability = jsonData.abilities[i];
        console.log(`   [${i}] ${ability.name}: level ${ability.level}, damage ${ability.damage}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error sincronizando abilities:', error.message);
  }
}

(async () => {
  await syncRealAbilities();
  console.log('\n🎉 Sincronización completada');
})();
