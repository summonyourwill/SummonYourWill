// scripts/createCleanVillageChief.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';
const CLEAN_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\clean';

// Crear directorio clean si no existe
if (!fs.existsSync(CLEAN_BASE)) {
  fs.mkdirSync(CLEAN_BASE, { recursive: true });
}

async function createCleanVillageChief() {
  try {
    console.log('🧹 Creando villagechief.json limpio...');
    
    const filePath = path.join(BASE, 'villagechief.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('⚠️ Archivo villagechief.json no encontrado');
      return;
    }
    
    // Leer archivo actual
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Crear objeto limpio
    const cleanData = {
      _id: jsonData._id || 'cfd1b9f7-6e88-42e0-b9c0-8a6d6af2d76c',
      name: jsonData.name || 'Fabián',
      level: jsonData.level || 1,
      exp: jsonData.exp || 0,
      nivel: jsonData.nivel || 1,
      experiencia: jsonData.experiencia || 0,
      hpPotions: jsonData.hpPotions || 0,
      manaPotions: jsonData.manaPotions || 0,
      expPotions: jsonData.expPotions || 0,
      energyPotions: jsonData.energyPotions || 0,
      // abilities: array simple de 100 elementos (sin abilities.habilities)
      abilities: Array.from({ length: 100 }, (_, i) => ({
        name: `No name${i + 1}`,
        img: "",
        desc: "",
        level: 1
      }))
    };
    
    // Crear backup del archivo original
    const backupPath = path.join(CLEAN_BASE, `villagechief.json.backup.${Date.now()}`);
    fs.writeFileSync(backupPath, data);
    console.log(`📦 Backup creado: ${backupPath}`);
    
    // Guardar archivo limpio
    const cleanJson = JSON.stringify(cleanData, null, 2);
    const cleanFilePath = path.join(CLEAN_BASE, 'villagechief.json');
    fs.writeFileSync(cleanFilePath, cleanJson, 'utf8');
    
    const originalSize = data.length;
    const cleanSize = cleanJson.length;
    const reduction = ((originalSize - cleanSize) / originalSize * 100).toFixed(1);
    
    console.log('✅ villagechief.json limpio creado');
    console.log(`   Tamaño original: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Tamaño limpio: ${(cleanSize / 1024).toFixed(2)} KB`);
    console.log(`   Reducción: ${reduction}%`);
    console.log(`   - _id: ${cleanData._id}`);
    console.log(`   - abilities: array de ${cleanData.abilities.length} elementos`);
    console.log(`   - partnerAbilities: excluido`);
    console.log(`   - abilities.habilities: excluido`);
    
  } catch (error) {
    console.error('❌ Error creando villagechief limpio:', error.message);
  }
}

(async () => {
  console.log('🧹 Iniciando limpieza de villagechief.json...');
  await createCleanVillageChief();
  console.log('🎉 Limpieza completada');
  console.log(`Archivo limpio guardado en: ${CLEAN_BASE}`);
})();
