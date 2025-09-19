// scripts/createUltraMinimalVillageChief.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';
const MINIMAL_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\minimal';

async function createUltraMinimalVillageChief() {
  try {
    console.log('📝 Creando archivo ultra mínimo para villagechief...');
    
    // Leer archivo original
    const data = fs.readFileSync(path.join(BASE, 'villagechief.json'), 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto ultra mínimo con solo campos básicos
    const ultraMinimalData = {
      name: jsonData.name || 'Fabián',
      level: jsonData.level || 1,
      exp: jsonData.exp || 0,
      _id: 'single',
      nivel: jsonData.nivel || 1,
      experiencia: jsonData.experiencia || 0
    };
    
    // Escribir archivo ultra mínimo
    const ultraMinimalJson = JSON.stringify(ultraMinimalData, null, 2);
    fs.writeFileSync(path.join(MINIMAL_BASE, 'villagechief_ultra_minimal.json'), ultraMinimalJson, 'utf8');
    
    const originalSize = fs.statSync(path.join(BASE, 'villagechief.json')).size;
    const ultraMinimalSize = fs.statSync(path.join(MINIMAL_BASE, 'villagechief_ultra_minimal.json')).size;
    
    console.log(`✅ villagechief ultra mínimo creado`);
    console.log(`   Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Tamaño ultra mínimo: ${(ultraMinimalSize / 1024).toFixed(2)} KB`);
    console.log(`   Reducción: ${((originalSize - ultraMinimalSize) / originalSize * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error(`❌ Error creando archivo ultra mínimo:`, error.message);
  }
}

(async () => {
  await createUltraMinimalVillageChief();
  console.log('🎉 Archivo ultra mínimo creado');
})();


