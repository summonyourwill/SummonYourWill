// scripts/showAbilitiesLocation.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function showAbilitiesLocation() {
  try {
    console.log('🔍 Mostrando ubicación de abilities en villagechief.json...');
    
    const filePath = path.join(BASE, 'villagechief.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo villagechief.json no encontrado');
      return;
    }
    
    const rawData = fs.readFileSync(filePath, 'utf8');
    const lines = rawData.split('\n');
    
    console.log(`📄 Archivo total: ${lines.length} líneas`);
    
    // Encontrar la línea donde empiezan las abilities
    let abilitiesStartLine = -1;
    let abilitiesEndLine = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('"abilities"')) {
        abilitiesStartLine = i + 1;
        console.log(`🎯 Línea ${abilitiesStartLine}: ${lines[i].trim()}`);
        break;
      }
    }
    
    if (abilitiesStartLine === -1) {
      console.log('❌ No se encontró la línea de abilities');
      return;
    }
    
    // Mostrar las líneas alrededor de abilities
    console.log('\n📝 Líneas alrededor de abilities:');
    const start = Math.max(0, abilitiesStartLine - 3);
    const end = Math.min(lines.length, abilitiesStartLine + 10);
    
    for (let i = start; i < end; i++) {
      const marker = i === abilitiesStartLine - 1 ? '🎯' : '  ';
      console.log(`${marker} ${i + 1}: ${lines[i]}`);
    }
    
    // Buscar el final del array de abilities
    let bracketCount = 0;
    let foundStart = false;
    
    for (let i = abilitiesStartLine - 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('"abilities"')) {
        foundStart = true;
      }
      
      if (foundStart) {
        // Contar brackets
        for (const char of line) {
          if (char === '[') bracketCount++;
          if (char === ']') bracketCount--;
        }
        
        if (bracketCount === 0 && foundStart) {
          abilitiesEndLine = i + 1;
          break;
        }
      }
    }
    
    if (abilitiesEndLine !== -1) {
      console.log(`\n🏁 El array de abilities termina en la línea ${abilitiesEndLine}`);
      console.log(`📊 Total de líneas de abilities: ${abilitiesEndLine - abilitiesStartLine + 1}`);
    }
    
    // Mostrar algunas abilities específicas
    console.log('\n🎯 Buscando abilities específicas:');
    const abilitiesToFind = ['"Ability 1"', '"Ability 2"', '"Ability 50"', '"Ability 100"'];
    
    abilitiesToFind.forEach(abilityName => {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(abilityName)) {
          console.log(`   ${abilityName}: Línea ${i + 1}`);
          break;
        }
      }
    });
    
    // Verificar que el archivo se puede abrir correctamente
    console.log('\n🔍 Verificación de apertura del archivo:');
    console.log(`   - Ruta: ${filePath}`);
    console.log(`   - Existe: ${fs.existsSync(filePath) ? '✅ Sí' : '❌ No'}`);
    console.log(`   - Tamaño: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);
    console.log(`   - Última modificación: ${fs.statSync(filePath).mtime}`);
    
  } catch (error) {
    console.error('❌ Error mostrando ubicación:', error.message);
  }
}

(async () => {
  await showAbilitiesLocation();
  console.log('\n🎉 Verificación de ubicación completada');
})();

