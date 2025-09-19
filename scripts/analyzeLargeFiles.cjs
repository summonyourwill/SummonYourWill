// scripts/analyzeLargeFiles.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function analyzeFile(filePath, maxBytes = 1000) {
  try {
    const stats = fs.statSync(filePath);
    console.log(`\n📁 Archivo: ${path.basename(filePath)}`);
    console.log(`Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Leer solo los primeros bytes para ver la estructura
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(Math.min(maxBytes, stats.size));
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);
    
    const content = buffer.toString('utf8', 0, bytesRead);
    console.log(`Primeros ${bytesRead} caracteres:`);
    console.log(content);
    
    // Intentar parsear como JSON para ver si es válido
    try {
      const fullContent = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(fullContent);
      console.log(`✅ JSON válido`);
      console.log(`Tipo: ${Array.isArray(parsed) ? 'Array' : 'Object'}`);
      if (Array.isArray(parsed)) {
        console.log(`Elementos: ${parsed.length}`);
      } else {
        console.log(`Claves: ${Object.keys(parsed).join(', ')}`);
      }
    } catch (jsonError) {
      console.log(`❌ JSON inválido: ${jsonError.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

(async () => {
  console.log('🔍 Analizando archivos grandes...');
  
  await analyzeFile(path.join(BASE, 'partner.json'));
  await analyzeFile(path.join(BASE, 'villagechief.json'));
  
  console.log('\n🎉 Análisis completado');
})();


