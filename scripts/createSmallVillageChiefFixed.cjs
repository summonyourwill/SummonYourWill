// scripts/createSmallVillageChiefFixed.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';
const SMALL_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\small_fixed';

// Crear directorio small_fixed si no existe
if (!fs.existsSync(SMALL_BASE)) {
  fs.mkdirSync(SMALL_BASE, { recursive: true });
}

async function createSmallVillageChiefFixed(inputPath, outputPath) {
  try {
    console.log('🔧 Creando villagechief.json pequeño con estructura corregida...');
    
    const data = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto pequeño con estructura corregida
    const smallData = {
      _id: 'single',
      name: jsonData.name || 'Fabián',
      level: jsonData.level || 1,
      exp: jsonData.exp || 0,
      nivel: jsonData.nivel || 1,
      experiencia: jsonData.experiencia || 0,
      hpPotions: jsonData.hpPotions || 0,
      manaPotions: jsonData.manaPotions || 0,
      expPotions: jsonData.expPotions || 0,
      energyPotions: jsonData.energyPotions || 0,
      // abilities: array fijo de 100 elementos (sin abilities.habilities)
      abilities: Array.from({ length: 100 }, (_, i) => ({
        name: `No name${i + 1}`,
        img: "",
        desc: "",
        level: 1
      }))
    };
    
    // Escribir archivo pequeño
    const smallJson = JSON.stringify(smallData, null, 2);
    fs.writeFileSync(outputPath, smallJson, 'utf8');
    
    const originalSize = fs.statSync(inputPath).size;
    const smallSize = fs.statSync(outputPath).size;
    
    console.log('✅ villagechief.json pequeño creado');
    console.log(`   Tamaño original: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Tamaño pequeño: ${(smallSize / 1024).toFixed(2)} KB`);
    console.log(`   Reducción: ${((originalSize - smallSize) / originalSize * 100).toFixed(1)}%`);
    console.log(`   - abilities: array fijo de ${smallData.abilities.length} elementos`);
    console.log(`   - abilities.habilities excluido: Sí`);
    
  } catch (error) {
    console.error('❌ Error creando villagechief.json pequeño:', error.message);
  }
}

(async () => {
  console.log('🔧 Creando archivo pequeño con estructura corregida...');
  
  // Crear villagechief pequeño con estructura corregida
  await createSmallVillageChiefFixed(
    path.join(BASE, 'villagechief.json'),
    path.join(SMALL_BASE, 'villagechief.json')
  );
  
  console.log('\n🎉 Archivo pequeño creado');
  console.log(`Archivo pequeño guardado en: ${SMALL_BASE}`);
})();

