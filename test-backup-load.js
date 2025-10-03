const { loadGame } = require('./src/core/saveManager.cjs');
const fs = require('fs').promises;
const path = require('path');

async function testBackupLoad() {
  console.log('🧪 Probando carga de respaldo...');
  
  // Simular que no existe save.json
  const SAVE_DIR = path.join(process.env.USERPROFILE || process.env.HOME, 'Documents', 'SummonYourWillSaves');
  const SAVE_FILE_PATH = path.join(SAVE_DIR, 'save.json');
  
  try {
    // Verificar si existe save.json
    await fs.access(SAVE_FILE_PATH);
    console.log('✅ save.json existe, renombrando temporalmente...');
    await fs.rename(SAVE_FILE_PATH, SAVE_FILE_PATH + '.backup');
  } catch (error) {
    console.log('ℹ️ save.json no existe, continuando con la prueba...');
  }
  
  try {
    // Intentar cargar el juego (debería cargar partida0.json)
    const gameData = await loadGame({ energia: 100, heroes: [], fotos: [] });
    
    console.log('✅ ¡Carga exitosa!');
    console.log('📊 Datos cargados:');
    console.log('- Energía:', gameData.energia);
    console.log('- Héroes:', gameData.heroes ? gameData.heroes.length : 0);
    console.log('- Village Chief:', gameData.villageChief ? 'Sí' : 'No');
    console.log('- Partner:', gameData.partner ? 'Sí' : 'No');
    
    if (gameData.energia && gameData.energia > 0) {
      console.log('🎉 ¡La carga de respaldo funciona correctamente!');
    } else {
      console.log('⚠️ Los datos cargados parecen ser los datos por defecto');
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    // Restaurar save.json si existía
    try {
      await fs.rename(SAVE_FILE_PATH + '.backup', SAVE_FILE_PATH);
      console.log('✅ save.json restaurado');
    } catch (error) {
      // No hacer nada si no existía
    }
  }
}

testBackupLoad().catch(console.error);

