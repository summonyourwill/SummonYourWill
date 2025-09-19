// scripts/createMinimalFiles.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';
const MINIMAL_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\minimal';

// Crear directorio minimal si no existe
if (!fs.existsSync(MINIMAL_BASE)) {
  fs.mkdirSync(MINIMAL_BASE, { recursive: true });
}

async function createMinimalFile(inputPath, outputPath, essentialFields) {
  try {
    console.log(`📝 Creando archivo mínimo ${path.basename(inputPath)}...`);
    
    // Leer archivo en chunks para evitar problemas de memoria
    const data = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto mínimo con solo campos esenciales
    const minimalData = {};
    essentialFields.forEach(field => {
      if (jsonData[field] !== undefined) {
        minimalData[field] = jsonData[field];
      }
    });
    
    // Escribir archivo mínimo
    const minimalJson = JSON.stringify(minimalData, null, 2);
    fs.writeFileSync(outputPath, minimalJson, 'utf8');
    
    const originalSize = fs.statSync(inputPath).size;
    const minimalSize = fs.statSync(outputPath).size;
    
    console.log(`✅ ${path.basename(inputPath)} creado`);
    console.log(`   Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Tamaño mínimo: ${(minimalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Reducción: ${((originalSize - minimalSize) / originalSize * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error(`❌ Error creando archivo mínimo ${path.basename(inputPath)}:`, error.message);
  }
}

(async () => {
  console.log('📝 Creando archivos JSON mínimos...');
  
  // Campos esenciales para partner
  const partnerFields = [
    'name', 'level', 'exp', 'hpPotions', 'manaPotions', 'expPotions', 
    'energyPotions', 'energia', '_id', 'chief_id', 'nivel', 'experiencia', 
    'inventario', 'stats'
  ];
  
  // Campos esenciales para villagechief (sin partnerAbilities)
  const villageChiefFields = [
    'name', 'level', 'exp', 'hpPotions', 'manaPotions', 'energyPotions', 
    'expPotions', 'habilities', 'unlockedFamiliars', 'unlockedHabilities', 
    'unlockedPartnerAbilities', 'promoteCost', 'dailyTributeRewards', 
    'dailyTributeDate', '_id', 'nivel', 'experiencia', 'abilities', 
    'inventario', 'stats'
  ];
  
  // Crear partner mínimo
  await createMinimalFile(
    path.join(BASE, 'partner.json'),
    path.join(MINIMAL_BASE, 'partner.json'),
    partnerFields
  );
  
  // Crear villagechief mínimo (sin partnerAbilities)
  await createMinimalFile(
    path.join(BASE, 'villagechief.json'),
    path.join(MINIMAL_BASE, 'villagechief.json'),
    villageChiefFields
  );
  
  console.log('\n🎉 Archivos mínimos creados');
  console.log(`Archivos mínimos guardados en: ${MINIMAL_BASE}`);
})();


