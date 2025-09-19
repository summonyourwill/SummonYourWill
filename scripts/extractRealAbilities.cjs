// scripts/extractRealAbilities.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function extractRealAbilities() {
  try {
    console.log('🔍 Extrayendo abilities reales del juego...');
    
    const filePath = path.join(BASE, 'villagechief.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo villagechief.json no encontrado');
      return;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    console.log('📋 Información del villagechief:');
    console.log(`   - _id: ${jsonData._id}`);
    console.log(`   - name: ${jsonData.name}`);
    console.log(`   - level: ${jsonData.level}`);
    
    // Buscar habilities (abilities reales del juego)
    if (jsonData.habilities && Array.isArray(jsonData.habilities)) {
      console.log(`\n🎯 Habilities encontradas: ${jsonData.habilities.length} elementos`);
      
      // Mostrar las primeras 10 habilities reales
      console.log('\n📝 Primeras 10 habilities reales:');
      for (let i = 0; i < Math.min(10, jsonData.habilities.length); i++) {
        const hability = jsonData.habilities[i];
        console.log(`\n   [${i}] ${hability.name}:`);
        console.log(`       - img: "${hability.img}"`);
        console.log(`       - desc: "${hability.desc}"`);
        console.log(`       - level: ${hability.level}`);
        console.log(`       - imgOffset: ${hability.imgOffset || 'undefined'}`);
        console.log(`       - imgOffsetX: ${hability.imgOffsetX || 'undefined'}`);
        console.log(`       - modified: ${hability.modified || 'undefined'}`);
        console.log(`       - firstModified: ${hability.firstModified || 'undefined'}`);
        console.log(`       - number: ${hability.number || 'undefined'}`);
        console.log(`       - stepImgs: ${Array.isArray(hability.stepImgs) ? `[${hability.stepImgs.length} elementos]` : 'No es array'}`);
        console.log(`       - activeStep: ${hability.activeStep || 'undefined'}`);
      }
      
      // Estadísticas de habilities reales
      console.log('\n📊 Estadísticas de habilities reales:');
      let withImages = 0;
      let withDescriptions = 0;
      let withRealNames = 0;
      let withLevels = 0;
      
      jsonData.habilities.forEach(hability => {
        if (hability.img && hability.img !== '') withImages++;
        if (hability.desc && hability.desc !== '') withDescriptions++;
        if (hability.name && !hability.name.startsWith('No name')) withRealNames++;
        if (hability.level && hability.level > 1) withLevels++;
      });
      
      console.log(`   - Con imágenes: ${withImages}/${jsonData.habilities.length}`);
      console.log(`   - Con descripciones: ${withDescriptions}/${jsonData.habilities.length}`);
      console.log(`   - Con nombres reales: ${withRealNames}/${jsonData.habilities.length}`);
      console.log(`   - Con niveles > 1: ${withLevels}/${jsonData.habilities.length}`);
      
      return jsonData.habilities;
      
    } else {
      console.log('❌ No se encontraron habilities o no es un array');
      console.log(`   - Tipo: ${typeof jsonData.habilities}`);
      console.log(`   - Valor: ${jsonData.habilities}`);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error extrayendo abilities reales:', error.message);
    return null;
  }
}

(async () => {
  const realAbilities = await extractRealAbilities();
  if (realAbilities) {
    console.log('\n✅ Abilities reales extraídas exitosamente');
  } else {
    console.log('\n❌ No se pudieron extraer las abilities reales');
  }
  console.log('\n🎉 Extracción completada');
})();
