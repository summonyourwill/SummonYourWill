// scripts/createUltraSmallFiles.cjs
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';
const ULTRA_SMALL_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\ultra_small';

// Crear directorio ultra_small si no existe
if (!fs.existsSync(ULTRA_SMALL_BASE)) {
  fs.mkdirSync(ULTRA_SMALL_BASE, { recursive: true });
}

async function createUltraSmallVillageChief(inputPath, outputPath) {
  try {
    console.log('🔧 Creando villagechief.json ultra pequeño...');
    
    const data = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto ultra pequeño con solo campos básicos
    const ultraSmallData = {
      _id: 'single',
      name: jsonData.name || 'Fabián',
      level: jsonData.level || 1,
      exp: jsonData.exp || 0,
      // Solo algunos elementos del array abilities para probar
      abilities: (jsonData.habilities || jsonData.abilities || []).slice(0, 5) // Solo primeros 5 elementos
    };
    
    // Escribir archivo ultra pequeño
    const ultraSmallJson = JSON.stringify(ultraSmallData, null, 2);
    fs.writeFileSync(outputPath, ultraSmallJson, 'utf8');
    
    const originalSize = fs.statSync(inputPath).size;
    const ultraSmallSize = fs.statSync(outputPath).size;
    
    console.log('✅ villagechief.json ultra pequeño creado');
    console.log(`   Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Tamaño ultra pequeño: ${(ultraSmallSize / 1024).toFixed(2)} KB`);
    console.log(`   Reducción: ${((originalSize - ultraSmallSize) / originalSize * 100).toFixed(1)}%`);
    console.log(`   - abilities: ${ultraSmallData.abilities.length} elementos (solo primeros 5)`);
    
  } catch (error) {
    console.error('❌ Error creando villagechief.json ultra pequeño:', error.message);
  }
}

async function createUltraSmallPartner(inputPath, outputPath) {
  try {
    console.log('🔧 Creando partner.json ultra pequeño...');
    
    const data = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto ultra pequeño con solo campos básicos
    const ultraSmallData = {
      _id: uuidv4(), // ID único aleatorio
      name: jsonData.name || 'Partner',
      level: jsonData.level || 1,
      exp: jsonData.exp || 0,
      // Solo algunos elementos del array partnerAbilities para probar
      partnerAbilities: (jsonData.partnerAbilities || []).slice(0, 5) // Solo primeros 5 elementos
    };
    
    // Escribir archivo ultra pequeño
    const ultraSmallJson = JSON.stringify(ultraSmallData, null, 2);
    fs.writeFileSync(outputPath, ultraSmallJson, 'utf8');
    
    const originalSize = fs.statSync(inputPath).size;
    const ultraSmallSize = fs.statSync(outputPath).size;
    
    console.log('✅ partner.json ultra pequeño creado');
    console.log(`   Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Tamaño ultra pequeño: ${(ultraSmallSize / 1024).toFixed(2)} KB`);
    console.log(`   Reducción: ${((originalSize - ultraSmallSize) / originalSize * 100).toFixed(1)}%`);
    console.log(`   - _id: ${ultraSmallData._id}`);
    console.log(`   - partnerAbilities: ${ultraSmallData.partnerAbilities.length} elementos (solo primeros 5)`);
    
  } catch (error) {
    console.error('❌ Error creando partner.json ultra pequeño:', error.message);
  }
}

(async () => {
  console.log('🔧 Creando archivos JSON ultra pequeños...');
  
  // Crear villagechief ultra pequeño
  await createUltraSmallVillageChief(
    path.join(BASE, 'villagechief.json'),
    path.join(ULTRA_SMALL_BASE, 'villagechief.json')
  );
  
  // Crear partner ultra pequeño
  await createUltraSmallPartner(
    path.join(BASE, 'partner.json'),
    path.join(ULTRA_SMALL_BASE, 'partner.json')
  );
  
  console.log('\n🎉 Archivos ultra pequeños creados');
  console.log(`Archivos ultra pequeños guardados en: ${ULTRA_SMALL_BASE}`);
})();

