#!/usr/bin/env node

/**
 * Script de prueba para el sistema de cierre de emergencia
 * Verifica que todas las funcionalidades estén implementadas correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sistema de cierre de emergencia...\n');

// Verificar archivo main.cjs
const mainPath = path.join(__dirname, '..', 'main.cjs');
if (fs.existsSync(mainPath)) {
  const mainContent = fs.readFileSync(mainPath, 'utf8');
  
  console.log('✅ main.cjs encontrado');
  
  // Verificar importaciones necesarias
  const requiredImports = ['globalShortcut', 'Tray', 'Menu'];
  const missingImports = requiredImports.filter(imp => !mainContent.includes(imp));
  
  if (missingImports.length === 0) {
    console.log('✅ Todas las importaciones necesarias están presentes');
  } else {
    console.log('❌ Faltan importaciones:', missingImports.join(', '));
  }
  
  // Verificar función reallyQuit
  if (mainContent.includes('function reallyQuit')) {
    console.log('✅ Función reallyQuit implementada');
  } else {
    console.log('❌ Función reallyQuit no encontrada');
  }
  
  // Verificar atajo global
  if (mainContent.includes('Control+Shift+Q')) {
    console.log('✅ Atajo global Ctrl+Shift+Q configurado');
  } else {
    console.log('❌ Atajo global no configurado');
  }
  
  // Verificar icono de bandeja
  if (mainContent.includes('new Tray') && mainContent.includes('Salir (Forzar)')) {
    console.log('✅ Icono de bandeja configurado');
  } else {
    console.log('❌ Icono de bandeja no configurado');
  }
  
  // Verificar manejadores de eventos
  const eventHandlers = [
    'unresponsive',
    'render-process-gone',
    'child-process-gone',
    'before-quit',
    'will-quit'
  ];
  
  const missingHandlers = eventHandlers.filter(handler => !mainContent.includes(handler));
  
  if (missingHandlers.length === 0) {
    console.log('✅ Todos los manejadores de eventos están implementados');
  } else {
    console.log('❌ Faltan manejadores de eventos:', missingHandlers.join(', '));
  }
  
} else {
  console.log('❌ main.cjs no encontrado');
}

// Verificar archivo preload.cjs
const preloadPath = path.join(__dirname, '..', 'preload.cjs');
if (fs.existsSync(preloadPath)) {
  const preloadContent = fs.readFileSync(preloadPath, 'utf8');
  
  console.log('\n✅ preload.cjs encontrado');
  
  if (preloadContent.includes('emergencyQuit')) {
    console.log('✅ Función emergencyQuit expuesta al renderer');
  } else {
    console.log('❌ Función emergencyQuit no expuesta');
  }
  
} else {
  console.log('\n❌ preload.cjs no encontrado');
}

// Verificar iconos necesarios
const assetsPath = path.join(__dirname, '..', 'assets');
const requiredIcons = ['favicon.ico', 'favicon_16x16.png'];

console.log('\n🔍 Verificando iconos...');
requiredIcons.forEach(icon => {
  const iconPath = path.join(assetsPath, icon);
  if (fs.existsSync(iconPath)) {
    console.log(`✅ ${icon} encontrado`);
  } else {
    console.log(`❌ ${icon} no encontrado`);
  }
});

// Verificar documentación
const docsPath = path.join(__dirname, '..', 'EMERGENCY_EXIT_SYSTEM.md');
if (fs.existsSync(docsPath)) {
  console.log('\n✅ Documentación del sistema creada');
} else {
  console.log('\n❌ Documentación del sistema no encontrada');
}

console.log('\n📋 Resumen de verificación completado.');
console.log('Para probar el sistema:');
console.log('1. Ejecuta la aplicación: npm start');
console.log('2. Prueba el atajo: Ctrl+Shift+Q');
console.log('3. Verifica el icono de bandeja en la bandeja del sistema');
console.log('4. Revisa los logs en la consola para confirmar la configuración');
