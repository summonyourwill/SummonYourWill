// src/main/integration-example.cjs
const mongoose = require('mongoose');
require('dotenv').config();
const { loadMongoFlag } = require('../config/mongoFlag.cjs');

// Importar funciones de los repositorios
const { upsertHeroes } = require('./repos/heroesRepo.cjs');
const { upsertPets } = require('./repos/petsRepo.cjs');
const { upsertVillains } = require('./repos/villainsRepo.cjs');
const { upsertFamiliars } = require('./repos/familiarsRepo.cjs');
const { upsertPartner } = require('./repos/partnerRepo.cjs');
const { upsertVillageChief } = require('./repos/villageChiefRepo.cjs');

// Importar watchers
const { startWatchers } = require('./watchers.cjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'SummonYourWill';

// Función para inicializar MongoDB al arrancar la app
async function initializeMongoDB() {
  try {
    const enabled = await loadMongoFlag();
    if (!enabled) {
      console.log('[MongoDB] Deshabilitado por mongodbconnection.json');
      return;
    }
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
    console.log('[MongoDB] Conectado correctamente');
    
    // Iniciar watchers para sincronización automática
    startWatchers();
    console.log('[Watchers] Sistema de sincronización iniciado');
    
  } catch (error) {
    console.error('[MongoDB] Error al inicializar:', error);
    // No fallar la app si MongoDB no está disponible
  }
}

// Función para limpiar MongoDB al cerrar la app
async function cleanupMongoDB() {
  try {
    await mongoose.disconnect();
    console.log('[MongoDB] Desconectado correctamente');
  } catch (error) {
    console.error('[MongoDB] Error al desconectar:', error);
  }
}

module.exports = {
  initializeMongoDB,
  cleanupMongoDB
};
