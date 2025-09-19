#!/usr/bin/env node

/**
 * Script de prueba para el sistema de configuración de DevTools
 * Verifica que todas las funcionalidades estén implementadas correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sistema de configuración de DevTools...\n');

// Verificar archivo de configuración
const configPath = path.join(__dirname, '..', 'devtoolsenprod.json');
if (fs.existsSync(configPath)) {
  console.log('✅ devtoolsenprod.json encontrado');
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (config.hasOwnProperty('enableDevToolsInProduction')) {
      console.log('✅ Configuración enableDevToolsInProduction presente');
      console.log(`   Valor actual: ${config.enableDevToolsInProduction}`);
    } else {
      console.log('❌ Configuración enableDevToolsInProduction no encontrada');
    }
    
    if (config.description) {
      console.log('✅ Descripción presente');
    } else {
      console.log('❌ Descripción no encontrada');
    }
    
    if (config.notes && Array.isArray(config.notes)) {
      console.log('✅ Notas presentes y en formato correcto');
    } else {
      console.log('❌ Notas no encontradas o formato incorrecto');
    }
    
  } catch (err) {
    console.log('❌ Error al parsear JSON:', err.message);
  }
} else {
  console.log('❌ devtoolsenprod.json no encontrado');
}

// Verificar archivo main.cjs
const mainPath = path.join(__dirname, '..', 'main.cjs');
if (fs.existsSync(mainPath)) {
  const mainContent = fs.readFileSync(mainPath, 'utf8');
  
  console.log('\n✅ main.cjs encontrado');
  
  if (mainContent.includes('devtoolsenprod.json')) {
    console.log('✅ Lectura de configuración implementada');
  } else {
    console.log('❌ Lectura de configuración no implementada');
  }
  
  if (mainContent.includes('[DEVTOOLS]')) {
    console.log('✅ Logs de DevTools implementados');
  } else {
    console.log('❌ Logs de DevTools no implementados');
  }
  
  if (mainContent.includes('shouldEnableDevTools')) {
    console.log('✅ Lógica de habilitación de DevTools implementada');
  } else {
    console.log('❌ Lógica de habilitación de DevTools no implementada');
  }
  
} else {
  console.log('\n❌ main.cjs no encontrado');
}

// Verificar script de toggle
const togglePath = path.join(__dirname, 'toggle-devtools.cjs');
if (fs.existsSync(togglePath)) {
  console.log('\n✅ Script toggle-devtools.cjs encontrado');
  
  const toggleContent = fs.readFileSync(togglePath, 'utf8');
  
  if (toggleContent.includes('readConfig')) {
    console.log('✅ Función readConfig implementada');
  } else {
    console.log('❌ Función readConfig no implementada');
  }
  
  if (toggleContent.includes('writeConfig')) {
    console.log('✅ Función writeConfig implementada');
  } else {
    console.log('❌ Función writeConfig no implementada');
  }
  
  if (toggleContent.includes('toggleConfig')) {
    console.log('✅ Función toggleConfig implementada');
  } else {
    console.log('❌ Función toggleConfig no implementada');
  }
  
} else {
  console.log('\n❌ Script toggle-devtools.cjs no encontrado');
}

// Verificar package.json
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  
  console.log('\n✅ package.json encontrado');
  
  const devtoolsScripts = [
    'devtools:status',
    'devtools:enable', 
    'devtools:disable',
    'devtools:toggle'
  ];
  
  const missingScripts = devtoolsScripts.filter(script => !packageContent.includes(script));
  
  if (missingScripts.length === 0) {
    console.log('✅ Todos los scripts de DevTools están presentes');
  } else {
    console.log('❌ Faltan scripts de DevTools:', missingScripts.join(', '));
  }
  
  if (packageContent.includes('devtoolsenprod.json')) {
    console.log('✅ Archivo de configuración incluido en build');
  } else {
    console.log('❌ Archivo de configuración no incluido en build');
  }
  
} else {
  console.log('\n❌ package.json no encontrado');
}

// Verificar documentación
const docsPath = path.join(__dirname, '..', 'DEVTOOLS_CONFIG_README.md');
if (fs.existsSync(docsPath)) {
  console.log('\n✅ Documentación DEVTOOLS_CONFIG_README.md creada');
} else {
  console.log('\n❌ Documentación no encontrada');
}

console.log('\n📋 Resumen de verificación completado.');
console.log('\nPara probar el sistema:');
console.log('1. Ver estado: npm run devtools:status');
console.log('2. Habilitar: npm run devtools:enable');
console.log('3. Deshabilitar: npm run devtools:disable');
console.log('4. Cambiar: npm run devtools:toggle');
console.log('\nPara verificar en la aplicación:');
console.log('1. Ejecuta: npm start');
console.log('2. Busca en la consola: [DEVTOOLS] Configuración cargada');
console.log('3. En producción, las DevTools se comportarán según la configuración');
