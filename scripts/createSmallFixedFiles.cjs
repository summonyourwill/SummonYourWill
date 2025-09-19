// scripts/createSmallFixedFiles.cjs
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';
const SMALL_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\small';

// Crear directorio small si no existe
if (!fs.existsSync(SMALL_BASE)) {
  fs.mkdirSync(SMALL_BASE, { recursive: true });
}

async function createSmallVillageChief(inputPath, outputPath) {
  try {
    console.log('🔧 Creando villagechief.json pequeño...');
    
    const data = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto pequeño con solo campos esenciales
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
      // Solo el array abilities (renombrado de habilities)
      abilities: jsonData.habilities || jsonData.abilities || [],
      // Excluir abilities.habilities (el objeto completo)
      // Excluir avatar (imagen base64)
    };
    
    // Escribir archivo pequeño
    const smallJson = JSON.stringify(smallData, null, 2);
    fs.writeFileSync(outputPath, smallJson, 'utf8');
    
    const originalSize = fs.statSync(inputPath).size;
    const smallSize = fs.statSync(outputPath).size;
    
    console.log('✅ villagechief.json pequeño creado');
    console.log(`   Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Tamaño pequeño: ${(smallSize / 1024).toFixed(2)} KB`);
    console.log(`   Reducción: ${((originalSize - smallSize) / originalSize * 100).toFixed(1)}%`);
    console.log(`   - abilities: ${smallData.abilities.length} elementos`);
    console.log(`   - abilities.habilities excluido: Sí`);
    
  } catch (error) {
    console.error('❌ Error creando villagechief.json pequeño:', error.message);
  }
}

async function createSmallPartner(inputPath, outputPath) {
  try {
    console.log('🔧 Creando partner.json pequeño...');
    
    const data = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto pequeño con solo campos esenciales
    const smallData = {
      _id: uuidv4(), // ID único aleatorio
      name: jsonData.name || 'Partner',
      level: jsonData.level || 1,
      exp: jsonData.exp || 0,
      nivel: jsonData.nivel || 1,
      experiencia: jsonData.experiencia || 0,
      hpPotions: jsonData.hpPotions || 0,
      manaPotions: jsonData.manaPotions || 0,
      expPotions: jsonData.expPotions || 0,
      energyPotions: jsonData.energyPotions || 0,
      energia: jsonData.energia || 0,
      // Incluir partnerAbilities
      partnerAbilities: jsonData.partnerAbilities || [],
      // Excluir img (imagen base64)
    };
    
    // Escribir archivo pequeño
    const smallJson = JSON.stringify(smallData, null, 2);
    fs.writeFileSync(outputPath, smallJson, 'utf8');
    
    const originalSize = fs.statSync(inputPath).size;
    const smallSize = fs.statSync(outputPath).size;
    
    console.log('✅ partner.json pequeño creado');
    console.log(`   Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Tamaño pequeño: ${(smallSize / 1024).toFixed(2)} KB`);
    console.log(`   Reducción: ${((originalSize - smallSize) / originalSize * 100).toFixed(1)}%`);
    console.log(`   - _id: ${smallData._id}`);
    console.log(`   - partnerAbilities: ${smallData.partnerAbilities.length} elementos`);
    
  } catch (error) {
    console.error('❌ Error creando partner.json pequeño:', error.message);
  }
}

(async () => {
  console.log('🔧 Creando archivos JSON pequeños...');
  
  // Crear villagechief pequeño
  await createSmallVillageChief(
    path.join(BASE, 'villagechief.json'),
    path.join(SMALL_BASE, 'villagechief.json')
  );
  
  // Crear partner pequeño
  await createSmallPartner(
    path.join(BASE, 'partner.json'),
    path.join(SMALL_BASE, 'partner.json')
  );
  
  console.log('\n🎉 Archivos pequeños creados');
  console.log(`Archivos pequeños guardados en: ${SMALL_BASE}`);
})();

