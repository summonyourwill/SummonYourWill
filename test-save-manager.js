// Script de prueba para verificar el saveManager
const { saveGame } = require('./src/core/saveManager.cjs');

// Datos de prueba
const testData = {
  version: 1,
  savedAt: Date.now(),
  money: 1000,
  food: 500,
  wood: 300,
  stone: 200,
  houses: 3,
  terrain: 5,
  heroes: [
    {
      id: 1,
      name: "Heroe 1",
      level: 5,
      pet: "Mascota 1",
      petImg: "pet1.png",
      petLevel: 3,
      petExp: 150,
      petOrigin: "Origen 1",
      petFavorite: true,
      petResourceType: "food",
      petPendingCount: 5,
      petLastCollection: Date.now(),
      petExploreDay: "2024-01-01",
      petDesc: "Descripción de mascota 1"
    },
    {
      id: 2,
      name: "Heroe 2",
      level: 3,
      pet: "Mascota 2",
      petImg: "pet2.png",
      petLevel: 2,
      petExp: 75,
      petOrigin: "Origen 2",
      petFavorite: false,
      petResourceType: "wood",
      petPendingCount: 2,
      petLastCollection: Date.now(),
      petExploreDay: "2024-01-02",
      petDesc: "Descripción de mascota 2"
    },
    {
      id: 3,
      name: "Heroe 3",
      level: 7,
      pet: "", // Sin mascota
      petImg: "",
      petLevel: 1,
      petExp: 0,
      petOrigin: "No origin",
      petFavorite: false,
      petResourceType: null,
      petPendingCount: 0,
      petLastCollection: Date.now(),
      petExploreDay: "",
      petDesc: ""
    }
  ],
  villains: [
    {
      id: 1,
      name: "Villano 1",
      level: 10,
      floor: 1,
      origin: "Origen villano 1"
    },
    {
      id: 2,
      name: "Villano 2",
      level: 15,
      floor: 2,
      origin: "Origen villano 2"
    }
  ]
};

// Función de prueba
async function testSaveManager() {
  try {
    console.log('🧪 Iniciando prueba del saveManager...');
    console.log('📊 Datos de prueba:');
    console.log(`   - Heroes: ${testData.heroes.length}`);
    console.log(`   - Villanos: ${testData.villains.length}`);
    console.log(`   - Heroes con mascotas: ${testData.heroes.filter(h => h.pet && h.pet.trim() !== '').length}`);
    
    console.log('\n💾 Guardando datos de prueba...');
    await saveGame(testData);
    
    console.log('✅ Prueba completada exitosamente!');
    console.log('📁 Verifica que se hayan generado los siguientes archivos:');
    console.log('   - save.json');
    console.log('   - heroes.json');
    console.log('   - pets.json');
    console.log('   - villains.json');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

// Ejecutar la prueba
testSaveManager();
