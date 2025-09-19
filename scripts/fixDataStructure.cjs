// scripts/fixDataStructure.cjs
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';
const FIXED_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\fixed';

// Crear directorio fixed si no existe
if (!fs.existsSync(FIXED_BASE)) {
  fs.mkdirSync(FIXED_BASE, { recursive: true });
}

async function fixVillageChief(inputPath, outputPath) {
  try {
    console.log('🔧 Corrigiendo villagechief.json...');
    
    const data = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto corregido
    const fixedData = { ...jsonData };
    
    // 1. Excluir abilities.habilities (el objeto completo abilities)
    delete fixedData.abilities;
    
    // 2. Renombrar "habilities" a "abilities" (el array que viene después de expPotions)
    if (fixedData.habilities) {
      fixedData.abilities = fixedData.habilities;
      delete fixedData.habilities;
    }
    
    // 3. Asegurar que _id sea "single" para villagechief
    fixedData._id = 'single';
    
    // Escribir archivo corregido
    const fixedJson = JSON.stringify(fixedData, null, 2);
    fs.writeFileSync(outputPath, fixedJson, 'utf8');
    
    console.log('✅ villagechief.json corregido');
    console.log('   - Excluido abilities.habilities');
    console.log('   - Renombrado habilities → abilities');
    
  } catch (error) {
    console.error('❌ Error corrigiendo villagechief.json:', error.message);
  }
}

async function fixPartner(inputPath, outputPath) {
  try {
    console.log('🔧 Corrigiendo partner.json...');
    
    const data = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto corregido
    const fixedData = { ...jsonData };
    
    // 1. Cambiar _id de "single" a único aleatorio
    fixedData._id = uuidv4();
    
    // 2. Agregar partnerAbilities si no existe
    if (!fixedData.partnerAbilities) {
      fixedData.partnerAbilities = [];
    }
    
    // Escribir archivo corregido
    const fixedJson = JSON.stringify(fixedData, null, 2);
    fs.writeFileSync(outputPath, fixedJson, 'utf8');
    
    console.log('✅ partner.json corregido');
    console.log('   - _id cambiado a único aleatorio:', fixedData._id);
    console.log('   - partnerAbilities agregado');
    
  } catch (error) {
    console.error('❌ Error corrigiendo partner.json:', error.message);
  }
}

(async () => {
  console.log('🔧 Iniciando corrección de estructura de datos...');
  
  // Corregir villagechief.json
  await fixVillageChief(
    path.join(BASE, 'villagechief.json'),
    path.join(FIXED_BASE, 'villagechief.json')
  );
  
  // Corregir partner.json
  await fixPartner(
    path.join(BASE, 'partner.json'),
    path.join(FIXED_BASE, 'partner.json')
  );
  
  console.log('\n🎉 Corrección completada');
  console.log(`Archivos corregidos guardados en: ${FIXED_BASE}`);
})();


