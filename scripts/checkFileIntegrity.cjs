// scripts/checkFileIntegrity.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function checkFileIntegrity() {
  try {
    console.log('🔍 Verificando integridad del archivo villagechief.json...');
    
    const filePath = path.join(BASE, 'villagechief.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo villagechief.json no encontrado');
      return;
    }
    
    // Leer archivo como texto
    const rawData = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 Archivo leído: ${rawData.length} caracteres`);
    
    // Verificar si contiene "abilities"
    const hasAbilities = rawData.includes('"abilities"');
    console.log(`🔍 Contiene "abilities": ${hasAbilities ? '✅ Sí' : '❌ No'}`);
    
    // Verificar si contiene "habilities"
    const hasHabilities = rawData.includes('"habilities"');
    console.log(`🔍 Contiene "habilities": ${hasHabilities ? '❌ Sí (incorrecto)' : '✅ No (correcto)'}`);
    
    // Contar abilities
    const abilitiesMatches = rawData.match(/"name":\s*"Ability \d+"/g);
    const abilitiesCount = abilitiesMatches ? abilitiesMatches.length : 0;
    console.log(`🔢 Número de abilities encontradas: ${abilitiesCount}`);
    
    // Verificar estructura JSON
    try {
      const jsonData = JSON.parse(rawData);
      console.log(`✅ JSON válido`);
      console.log(`   - _id: ${jsonData._id}`);
      console.log(`   - name: ${jsonData.name}`);
      console.log(`   - abilities: ${jsonData.abilities ? jsonData.abilities.length : 0} elementos`);
      
      if (jsonData.abilities && jsonData.abilities.length > 0) {
        const firstAbility = jsonData.abilities[0];
        console.log(`   - abilities[0].name: "${firstAbility.name}"`);
        console.log(`   - abilities[0].damage: ${firstAbility.damage}`);
        console.log(`   - abilities[0].healing: ${firstAbility.healing}`);
      }
      
    } catch (parseError) {
      console.log(`❌ Error parseando JSON: ${parseError.message}`);
    }
    
    // Mostrar las primeras líneas del archivo
    console.log('\n📝 Primeras 10 líneas del archivo:');
    const lines = rawData.split('\n');
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      console.log(`   ${i + 1}: ${lines[i]}`);
    }
    
    // Mostrar líneas que contienen "abilities"
    console.log('\n🎯 Líneas que contienen "abilities":');
    const abilitiesLines = lines.filter((line) => line.includes('"abilities"'));
    abilitiesLines.forEach((line) => {
      const lineNumber = lines.indexOf(line) + 1;
      console.log(`   Línea ${lineNumber}: ${line.trim()}`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando integridad:', error.message);
  }
}

(async () => {
  await checkFileIntegrity();
  console.log('\n🎉 Verificación de integridad completada');
})();

