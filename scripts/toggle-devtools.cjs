#!/usr/bin/env node

/**
 * Script para cambiar la configuración de DevTools en producción
 * Uso: node scripts/toggle-devtools.cjs [true|false]
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'devtoolsenprod.json');

function readConfig() {
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('❌ Error al leer la configuración:', err.message);
    process.exit(1);
  }
}

function writeConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Configuración actualizada correctamente');
  } catch (err) {
    console.error('❌ Error al escribir la configuración:', err.message);
    process.exit(1);
  }
}

function showCurrentConfig() {
  const config = readConfig();
  const currentValue = config.enableDevToolsInProduction;
  console.log(`\n🔧 Configuración actual de DevTools en producción:`);
  console.log(`   enableDevToolsInProduction: ${currentValue}`);
  console.log(`   Estado: ${currentValue ? '🟢 HABILITADAS' : '🔴 DESHABILITADAS'}`);
  
  if (currentValue) {
    console.log(`\n⚠️  ADVERTENCIA: Las DevTools están habilitadas en producción.`);
    console.log(`   Esto puede exponer información sensible a los usuarios finales.`);
    console.log(`   Considera cambiarlo a 'false' antes de distribuir la aplicación.`);
  }
}

function toggleConfig(newValue) {
  const config = readConfig();
  const oldValue = config.enableDevToolsInProduction;
  
  if (newValue === undefined) {
    // Toggle el valor actual
    newValue = !oldValue;
  }
  
  config.enableDevToolsInProduction = newValue;
  writeConfig(config);
  
  console.log(`\n🔄 DevTools en producción cambiadas:`);
  console.log(`   ${oldValue} → ${newValue}`);
  console.log(`   Estado: ${newValue ? '🟢 HABILITADAS' : '🔴 DESHABILITADAS'}`);
  
  if (newValue) {
    console.log(`\n📝 Las DevTools ahora estarán disponibles en producción.`);
    console.log(`   Recuerda cambiar esto a 'false' antes de distribuir.`);
  } else {
    console.log(`\n✅ Las DevTools están deshabilitadas en producción (recomendado).`);
  }
}

function showHelp() {
  console.log(`
🔧 Script de configuración de DevTools en producción

Uso:
  node scripts/toggle-devtools.cjs [comando]

Comandos:
  true          - Habilita DevTools en producción
  false         - Deshabilita DevTools en producción
  toggle        - Cambia el valor actual (true ↔ false)
  status        - Muestra la configuración actual
  help          - Muestra esta ayuda

Ejemplos:
  node scripts/toggle-devtools.cjs true     # Habilita DevTools
  node scripts/toggle-devtools.cjs false    # Deshabilita DevTools
  node scripts/toggle-devtools.cjs toggle   # Cambia el valor actual
  node scripts/toggle-devtools.cjs status   # Muestra estado actual

⚠️  ADVERTENCIA: Habilitar DevTools en producción puede exponer información sensible.
   Solo usa 'true' para depuración y cambia a 'false' antes de distribuir.
`);
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
} else if (command === 'status') {
  showCurrentConfig();
} else if (command === 'toggle') {
  toggleConfig();
} else if (command === 'true') {
  toggleConfig(true);
} else if (command === 'false') {
  toggleConfig(false);
} else {
  console.error(`❌ Comando no válido: ${command}`);
  console.log('Usa "node scripts/toggle-devtools.cjs help" para ver la ayuda');
  process.exit(1);
}
