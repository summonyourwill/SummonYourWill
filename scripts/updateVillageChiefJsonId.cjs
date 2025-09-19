// scripts/updateVillageChiefJsonId.cjs
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function updateVillageChiefJsonId() {
  try {
    console.log('🔧 Actualizando _id en villagechief.json...');
    
    const filePath = path.join(BASE, 'villagechief.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('⚠️ Archivo villagechief.json no encontrado');
      return;
    }
    
    // Leer archivo actual
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Generar nuevo _id único
    const newId = uuidv4();
    console.log(`🆔 Nuevo _id generado: ${newId}`);
    
    // Actualizar _id
    jsonData._id = newId;
    
    // Crear backup
    const backupPath = path.join(BASE, `villagechief.json.backup.${Date.now()}`);
    fs.writeFileSync(backupPath, data);
    console.log(`📦 Backup creado: ${backupPath}`);
    
    // Guardar archivo actualizado
    const updatedJson = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync(filePath, updatedJson, 'utf8');
    
    console.log('✅ villagechief.json actualizado');
    console.log(`   - _id: ${jsonData._id}`);
    console.log(`   - name: ${jsonData.name}`);
    console.log(`   - abilities: ${jsonData.abilities ? jsonData.abilities.length : 0} elementos`);
    
  } catch (error) {
    console.error('❌ Error actualizando villagechief.json:', error.message);
  }
}

(async () => {
  console.log('🔧 Iniciando actualización de _id en villagechief.json...');
  await updateVillageChiefJsonId();
  console.log('🎉 Actualización completada');
})();
