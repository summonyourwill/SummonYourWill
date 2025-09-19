// scripts/updateVillageChiefId.cjs
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Configuración directa
const uri = 'mongodb://localhost:27017';
const dbName = 'SummonYourWill';

// Esquema
const VillageChiefSchema = new mongoose.Schema({
  _id: { type: String }
}, { timestamps: true, strict: false });

// Modelo
const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema, 'villagechief');

async function connectMongo() {
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function updateVillageChiefId() {
  try {
    console.log('🔧 Actualizando _id de villagechief...');
    
    // Buscar el documento actual con _id: "single"
    const currentDoc = await VillageChief.findOne({ _id: 'single' });
    
    if (!currentDoc) {
      console.log('⚠️ No se encontró documento villagechief con _id: "single"');
      return;
    }
    
    // Generar nuevo _id único
    const newId = uuidv4();
    console.log(`🆔 Nuevo _id generado: ${newId}`);
    
    // Crear nuevo documento con el nuevo _id
    const newDoc = { ...currentDoc.toObject(), _id: newId };
    delete newDoc.__v; // Remover __v de Mongoose
    
    // Insertar nuevo documento
    await VillageChief.create(newDoc);
    console.log('✅ Nuevo documento villagechief creado con _id único');
    
    // Eliminar documento antiguo
    await VillageChief.deleteOne({ _id: 'single' });
    console.log('🗑️ Documento antiguo eliminado');
    
    // Verificar el resultado
    const updatedDoc = await VillageChief.findOne({ _id: newId });
    if (updatedDoc) {
      console.log('✅ Verificación exitosa:');
      console.log(`   - _id: ${updatedDoc._id}`);
      console.log(`   - name: ${updatedDoc.name}`);
      console.log(`   - abilities: ${updatedDoc.abilities ? updatedDoc.abilities.length : 0} elementos`);
    }
    
  } catch (error) {
    console.error('❌ Error actualizando villagechief:', error.message);
  }
}

(async () => {
  await connectMongo();
  try {
    await updateVillageChiefId();
  } finally {
    await disconnectMongo();
  }
  console.log('🎉 Actualización completada');
})();
