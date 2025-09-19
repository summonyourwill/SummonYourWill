// scripts/compressImagesWithSharp.cjs
const { compressGameDataImages } = require('../src/main/imageCompression.cjs');
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function compressExistingImagesWithSharp() {
  try {
    console.log('🖼️ Iniciando compresión de imágenes con Sharp...');
    
    const files = [
      { name: 'villagechief.json', type: 'villagechief' },
      { name: 'partner.json', type: 'partner' },
      { name: 'heroes.json', type: 'heroes' },
      { name: 'villains.json', type: 'villains' },
      { name: 'pets.json', type: 'pets' },
      { name: 'familiars.json', type: 'familiars' }
    ];
    
    let totalFilesProcessed = 0;
    let totalImagesCompressed = 0;
    let totalAverageReduction = 0;
    
    for (const file of files) {
      const filePath = path.join(BASE, file.name);
      
      if (fs.existsSync(filePath)) {
        console.log(`\n📁 Procesando ${file.name}...`);
        
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(data);
          
          // Crear backup antes de comprimir
          const backupPath = path.join(BASE, `${file.name}.backup.${Date.now()}`);
          fs.writeFileSync(backupPath, data);
          console.log(`📦 Backup creado: ${backupPath}`);
          
          // Comprimir imágenes
          const result = await compressGameDataImages(jsonData, file.type);
          
          if (result.totalCompressed > 0) {
            // Guardar archivo comprimido
            const compressedJson = JSON.stringify(jsonData, null, 2);
            fs.writeFileSync(filePath, compressedJson, 'utf8');
            
            const originalSize = data.length;
            const compressedSize = compressedJson.length;
            const fileReduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
            
            console.log(`✅ ${file.name} procesado`);
            console.log(`   Tamaño original: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`);
            console.log(`   Tamaño comprimido: ${(compressedSize / (1024 * 1024)).toFixed(2)} MB`);
            console.log(`   Reducción del archivo: ${fileReduction}%`);
            console.log(`   Imágenes comprimidas: ${result.totalCompressed}`);
            console.log(`   Reducción promedio de imágenes: ${result.averageReduction.toFixed(1)}%`);
            
            totalFilesProcessed++;
            totalImagesCompressed += result.totalCompressed;
            totalAverageReduction += result.averageReduction;
          } else {
            console.log(`⚠️ No se encontraron imágenes para comprimir en ${file.name}`);
          }
          
        } catch (error) {
          console.error(`❌ Error procesando ${file.name}:`, error.message);
        }
      } else {
        console.log(`⚠️ Archivo no encontrado: ${file.name}`);
      }
    }
    
    if (totalFilesProcessed > 0) {
      const overallAverageReduction = (totalAverageReduction / totalFilesProcessed).toFixed(1);
      console.log(`\n🎉 Compresión completada:`);
      console.log(`   Archivos procesados: ${totalFilesProcessed}`);
      console.log(`   Imágenes comprimidas: ${totalImagesCompressed}`);
      console.log(`   Reducción promedio: ${overallAverageReduction}%`);
    } else {
      console.log(`\n⚠️ No se procesaron archivos`);
    }
    
  } catch (error) {
    console.error('❌ Error en la compresión:', error.message);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  compressExistingImagesWithSharp();
}

module.exports = { compressExistingImagesWithSharp };
