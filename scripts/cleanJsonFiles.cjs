// scripts/cleanJsonFiles.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';
const CLEAN_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\clean';

// Crear directorio clean si no existe
if (!fs.existsSync(CLEAN_BASE)) {
  fs.mkdirSync(CLEAN_BASE, { recursive: true });
}

async function cleanJsonFile(inputPath, outputPath, options = {}) {
  try {
    console.log(`🧹 Limpiando ${path.basename(inputPath)}...`);
    
    // Leer archivo en chunks para evitar problemas de memoria
    const data = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Limpiar datos
    const cleanedData = { ...jsonData };
    
    // Remover imágenes base64 si se especifica
    if (options.removeImages) {
      if (cleanedData.img) {
        cleanedData.img = '[REMOVED_BASE64_IMAGE]';
      }
      if (cleanedData.avatar) {
        cleanedData.avatar = '[REMOVED_BASE64_IMAGE]';
      }
    }
    
    // Remover campos específicos
    if (options.removeFields) {
      options.removeFields.forEach(field => {
        delete cleanedData[field];
      });
    }
    
    // Escribir archivo limpio
    const cleanJson = JSON.stringify(cleanedData, null, 2);
    fs.writeFileSync(outputPath, cleanJson, 'utf8');
    
    const originalSize = fs.statSync(inputPath).size;
    const cleanSize = fs.statSync(outputPath).size;
    
    console.log(`✅ ${path.basename(inputPath)} limpiado`);
    console.log(`   Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Tamaño limpio: ${(cleanSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Reducción: ${((originalSize - cleanSize) / originalSize * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error(`❌ Error limpiando ${path.basename(inputPath)}:`, error.message);
  }
}

(async () => {
  console.log('🧹 Iniciando limpieza de archivos JSON...');
  
  // Limpiar partner.json (remover imagen base64)
  await cleanJsonFile(
    path.join(BASE, 'partner.json'),
    path.join(CLEAN_BASE, 'partner.json'),
    { removeImages: true }
  );
  
  // Limpiar villagechief.json (remover imagen base64 y partnerAbilities)
  await cleanJsonFile(
    path.join(BASE, 'villagechief.json'),
    path.join(CLEAN_BASE, 'villagechief.json'),
    { 
      removeImages: true,
      removeFields: ['partnerAbilities']
    }
  );
  
  console.log('\n🎉 Limpieza completada');
  console.log(`Archivos limpios guardados en: ${CLEAN_BASE}`);
})();


