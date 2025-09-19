#!/usr/bin/env node

/**
 * Script de verificación de timers de entrenamiento
 * Verifica que el nuevo sistema de timers por minuto esté correctamente implementado
 */

const fs = require('fs');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`  ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'bright');
}

function logSection(message) {
  log(`\n${'-'.repeat(40)}`, 'cyan');
  log(`  ${message}`, 'cyan');
  log(`${'-'.repeat(40)}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Verificaciones principales
const VERIFICATIONS = [
  {
    name: 'Constantes de entrenamiento',
    file: 'src/utils/timerConstants.js',
    checks: [
      'TRAIN_TIMER_MINUTES = 3',
      'calculateTrainingTimeRemaining',
      'formatTrainingTime',
      'isTrainingComplete',
      'getTrainingEndTime'
    ]
  },
  {
    name: 'Sistema de entrenamiento principal',
    file: 'script.js',
    checks: [
      'TRAIN_TIMER_MINUTES, calculateTrainingTimeRemaining',
      'hero.trainingEndAt',
      'getTrainingEndTime()',
      'formatTrainingTime',
      'calculateTrainingTimeRemaining'
    ]
  },
  {
    name: 'Función gameTick optimizada',
    file: 'script.js',
    checks: [
      'calculateTrainingTimeRemaining(hero.trainingEndAt)',
      'formatTrainingTime(minutesRemaining)',
      'isTrainingComplete(hero.trainingEndAt)'
    ]
  },
  {
    name: 'Función processAllTimers',
    file: 'script.js',
    checks: [
      'timer.type === \'train\'',
      'calculateTrainingTimeRemaining(timer.endAt)',
      'formatTrainingTime(minutesRemaining)'
    ]
  },
  {
    name: 'Función finishTimer',
    file: 'script.js',
    checks: [
      'hero.trainingEndAt = null',
      'statEl.textContent = "Ready"',
      'mainEl.textContent = "Ready"'
    ]
  },
  {
    name: 'Timer principal optimizado',
    file: 'script.js',
    checks: [
      'elapsed >= MIN',
      'requestAnimationFrame(centralGameLoop)'
    ]
  }
];

function checkFile(filePath, checks) {
  logInfo(`Verificando archivo: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    logError(`Archivo no encontrado: ${filePath}`);
    return { passed: false, found: [], missing: checks };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const found = [];
  const missing = [];
  
  checks.forEach(check => {
    if (content.includes(check)) {
      found.push(check);
    } else {
      missing.push(check);
    }
  });
  
  return { passed: missing.length === 0, found, missing };
}

function verifyTrainingSystem() {
  logHeader('VERIFICACIÓN DEL SISTEMA DE TIMERS DE ENTRENAMIENTO');
  
  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;
  
  VERIFICATIONS.forEach(verification => {
    logSection(verification.name);
    
    const result = checkFile(verification.file, verification.checks);
    totalChecks += verification.checks.length;
    
    if (result.passed) {
      logSuccess(`✅ ${verification.name}: COMPLETO`);
      passedChecks += verification.checks.length;
      
      result.found.forEach(check => {
        logSuccess(`   ✓ ${check}`);
      });
    } else {
      logError(`❌ ${verification.name}: INCOMPLETO`);
      failedChecks += verification.checks.length;
      
      result.found.forEach(check => {
        logSuccess(`   ✓ ${check}`);
      });
      
      result.missing.forEach(check => {
        logError(`   ✗ ${check}`);
      });
    }
  });
  
  // Resumen final
  logHeader('RESUMEN DE VERIFICACIÓN');
  
  const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
  
  logInfo(`Total de verificaciones: ${totalChecks}`);
  logSuccess(`Verificaciones exitosas: ${passedChecks}`);
  logError(`Verificaciones fallidas: ${failedChecks}`);
  
  if (successRate >= 90) {
    logSuccess(`Tasa de éxito: ${successRate}% - SISTEMA IMPLEMENTADO CORRECTAMENTE`);
  } else if (successRate >= 70) {
    logWarning(`Tasa de éxito: ${successRate}% - SISTEMA PARCIALMENTE IMPLEMENTADO`);
  } else {
    logError(`Tasa de éxito: ${successRate}% - SISTEMA NO IMPLEMENTADO CORRECTAMENTE`);
  }
  
  // Verificaciones adicionales
  logHeader('VERIFICACIONES ADICIONALES');
  
  // Verificar que no hay referencias al sistema anterior
  const scriptContent = fs.readFileSync('script.js', 'utf8');
  
  const oldSystemPatterns = [
    'hero.trainTime--',
    'trainTime > 0 ? `${hero.trainTime}s`',
    'setInterval.*1000'
  ];
  
  oldSystemPatterns.forEach(pattern => {
    if (scriptContent.includes(pattern)) {
      logWarning(`⚠️  Posible referencia al sistema anterior: ${pattern}`);
    } else {
      logSuccess(`✅ No se encontró referencia al sistema anterior: ${pattern}`);
    }
  });
  
  // Verificar estructura de archivos
  logSection('Estructura de archivos');
  
  const requiredFiles = [
    'src/utils/timerConstants.js',
    'TRAINING_TIMER_IMPLEMENTATION.md'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`✅ ${file} existe`);
    } else {
      logError(`❌ ${file} no existe`);
    }
  });
  
  return {
    total: totalChecks,
    passed: passedChecks,
    failed: failedChecks,
    successRate: parseFloat(successRate)
  };
}

function main() {
  try {
    const result = verifyTrainingSystem();
    
    if (result.successRate >= 90) {
      log('\n🎉 ¡VERIFICACIÓN EXITOSA! El sistema de timers de entrenamiento está completamente implementado.', 'green');
      process.exit(0);
    } else if (result.successRate >= 70) {
      log('\n⚠️  VERIFICACIÓN PARCIAL. Algunas funcionalidades pueden no estar completamente implementadas.', 'yellow');
      process.exit(1);
    } else {
      log('\n❌ VERIFICACIÓN FALLIDA. El sistema de timers de entrenamiento no está correctamente implementado.', 'red');
      process.exit(1);
    }
  } catch (error) {
    logError(`Error durante la verificación: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { verifyTrainingSystem };
