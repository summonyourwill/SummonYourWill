// scripts/createMinimalVillageChief.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';
const MINIMAL_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\minimal';

async function createMinimalVillageChief() {
  try {
    console.log('📝 Creando villagechief.json mínimo...');
    
    // Leer archivo original
    const data = fs.readFileSync(path.join(BASE, 'villagechief.json'), 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto mínimo con solo campos básicos
    const minimalData = {
      _id: 'single',
      name: jsonData.name || 'Fabián',
      level: jsonData.level || 1,
      exp: jsonData.exp || 0,
      // Solo el array abilities básico (sin abilities.habilities)
      abilities: []
    };
    
    // Escribir archivo mínimo
    const minimalJson = JSON.stringify(minimalData, null, 2);
    fs.writeFileSync(path.join(MINIMAL_BASE, 'villagechief.json'), minimalJson, 'utf8');
    
    const originalSize = fs.statSync(path.join(BASE, 'villagechief.json')).size;
    const minimalSize = fs.statSync(path.join(MINIMAL_BASE, 'villagechief.json')).size;
    
    console.log(`✅ villagechief mínimo creado`);
    console.log(`   Tamaño original: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Tamaño mínimo: ${(minimalSize / 1024).toFixed(2)} KB`);
    console.log(`   Reducción: ${((originalSize - minimalSize) / originalSize * 100).toFixed(1)}%`);
    console.log(`   - abilities: array vacío (abilities.habilities excluido)`);
    
  } catch (error) {
    console.error(`❌ Error al crear archivo mínimo para villagechief:`, error.message);
  }
}

(async () => {
  if (!fs.existsSync(MINIMAL_BASE)) {
    fs.mkdirSync(MINIMAL_BASE, { recursive: true });
  }
  await createMinimalVillageChief();
  console.log('\n🎉 Archivo mínimo creado');
})();
