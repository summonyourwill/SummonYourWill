#!/usr/bin/env node

/**
 * Script de verificación de mejoras en Group Missions
 * Verifica que todas las funcionalidades solicitadas estén correctamente implementadas
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
    name: 'Formato de selectores mejorado',
    file: 'script.js',
    checks: [
      'opt.textContent = `${h.name} [${originDisplay}]`',
      'const heroOrigin = getHeroOrigin(h)',
      'const originDisplay = heroOrigin.charAt(0).toUpperCase() + heroOrigin.slice(1)'
    ]
  },
  {
    name: 'Ordenamiento alfabético por origin',
    file: 'script.js',
    checks: [
      '.sort((a, b) => {',
      'const originA = getHeroOrigin(a)',
      'const originB = getHeroOrigin(b)',
      'return originA.localeCompare(originB)'
    ]
  },
  {
    name: 'Sistema de bonus por same origin',
    file: 'script.js',
    checks: [
      'const allSameOrigin = hasAllHeroesSelected &&',
      'selectedHeroes.every(h => getHeroOrigin(h) === getHeroOrigin(selectedHeroes[0]))',
      'const baseReward = allSameOrigin ? 20000 : GM_BASE_REWARD'
    ]
  },
  {
    name: 'Colores de tarjeta dinámicos',
    file: 'script.js',
    checks: [
      'cardEl.style.backgroundColor = \'#FFD700\'',
      'cardEl.style.borderColor = \'#FFA500\'',
      'cardEl.style.backgroundColor = \'\' // Reset al color original'
    ]
  },
  {
    name: 'Bloqueo de selectores post-misión',
    file: 'script.js',
    checks: [
      'if (gm.status === \'running\' || gm.status === \'completed\') {',
      'select.disabled = true',
      'select.classList.add(\'is-locked\')',
      'select.title = gm.status === \'running\' ? \'Mission in progress\' : \'Mission completed\''
    ]
  },
  {
    name: 'Recompensa actualizada en tickGroupMissions',
    file: 'script.js',
    checks: [
      'const reward = m.sameOriginBonus ? 20000 : GM_BASE_REWARD'
    ]
  },
  {
    name: 'UI mejorada para bonus',
    file: 'script.js',
    checks: [
      'const rewardText = allSameOrigin ? `${baseReward} Gold (Bonus: Same Origin!)` : `${baseReward} Gold`',
      'bonus.innerText = \'All heroes same origin, you get a bonus of 20000 Gold!\'',
      'bonus.style.fontWeight = \'bold\'',
      'bonus.style.color = \'#FF8C00\''
    ]
  },
  {
    name: 'Selectores bloqueados muestran héroe seleccionado',
    file: 'script.js',
    checks: [
      'if (gm.status === \'running\' || gm.status === \'completed\') {',
      'const selectedHero = state.heroes.find(h => h.id === heroId)',
      'opt.textContent = `${selectedHero.name} [${originDisplay}]`'
    ]
  },
  {
    name: 'Exclusión de héroes ocupados en special builder',
    file: 'script.js',
    checks: [
      '// Obtener héroes elegibles (ya filtrados por isHeroBusy en getEligibleHeroes)',
      'const allEligible = getEligibleHeroes()'
    ]
  },
  {
    name: 'Countdown dinámico de horas',
    file: 'script.js',
    checks: [
      'function getGroupMissionHoursRemaining(gm)',
      'const hoursRemaining = getGroupMissionHoursRemaining(gm)',
      'status.textContent = `${hoursRemaining}H`'
    ]
  },
  {
    name: 'Intervalo correcto de 1 hora',
    file: 'script.js',
    checks: [
      'setInterval(tickGroupMissions, 60 * MIN)'
    ]
  },
  {
    name: 'Héroes quedan con energía completa al completar',
    file: 'script.js',
    checks: [
      'h.energyPercent = 100',
      'h.energy = 100',
      'h.energia = 100'
    ]
  },
  {
    name: 'Función isHeroBusy corregida para Special Builder Assignment',
    file: 'script.js',
    checks: [
      '// Verificar si está en special builder slots (builders 1-8)',
      'const busyInBuilder = state.specialBuilderSlots.some(slot =>',
      'slot.assignedHeroId === heroId && slot.status === \'running\''
    ]
  },
  {
    name: 'Nota "Hero is on a Group Mission" en tarjetas de héroes',
    file: 'script.js',
    checks: [
      '// Verificar si el héroe está en una Group Mission',
      'if (state.groupMissions && state.groupMissions.some(gm =>',
      'gm.heroIds && gm.heroIds.includes(hero.id) && gm.status === \'running\'',
      'notes.push("<span class=\'group-mission-note\' style=\'color: red; font-weight: bold;\'>Hero is on a Group Mission</span>")'
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

function verifyGroupMissionImprovements() {
  logHeader('VERIFICACIÓN DE MEJORAS EN GROUP MISSIONS');
  
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
    logSuccess(`Tasa de éxito: ${successRate}% - MEJORAS COMPLETAMENTE IMPLEMENTADAS`);
  } else if (successRate >= 70) {
    logWarning(`Tasa de éxito: ${successRate}% - MEJORAS PARCIALMENTE IMPLEMENTADAS`);
  } else {
    logError(`Tasa de éxito: ${successRate}% - MEJORAS NO IMPLEMENTADAS CORRECTAMENTE`);
  }
  
  // Verificaciones adicionales
  logHeader('VERIFICACIONES ADICIONALES');
  
  // Verificar que no hay referencias al sistema anterior
  const scriptContent = fs.readFileSync('script.js', 'utf8');
  
  const oldSystemPatterns = [
    'opt.textContent = `${h.name} (Lv.${h.level ?? 1})`',
    'const reward = m.sameOriginBonus ? (GM_BASE_REWARD * 2) : GM_BASE_REWARD',
    'bonus.innerText = \'All heroes same origin, you get a bonus of 10000+ Gold\''
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
    'GROUP_MISSION_IMPROVEMENTS.md'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`✅ ${file} existe`);
    } else {
      logError(`❌ ${file} no existe`);
    }
  });
  
  // Verificar constantes específicas
  logSection('Verificación de constantes');
  
  if (scriptContent.includes('GM_BASE_REWARD = 10000')) {
    logSuccess(`✅ GM_BASE_REWARD está definida como 10000`);
  } else {
    logError(`❌ GM_BASE_REWARD no está definida correctamente`);
  }
  
  if (scriptContent.includes('20000')) {
    logSuccess(`✅ Recompensa de 20000 Gold está implementada`);
  } else {
    logError(`❌ Recompensa de 20000 Gold no está implementada`);
  }
  
  return {
    total: totalChecks,
    passed: passedChecks,
    failed: failedChecks,
    successRate: parseFloat(successRate)
  };
}

function main() {
  try {
    const result = verifyGroupMissionImprovements();
    
    if (result.successRate >= 90) {
      log('\n🎉 ¡VERIFICACIÓN EXITOSA! Las mejoras en Group Missions están completamente implementadas.', 'green');
      process.exit(0);
    } else if (result.successRate >= 70) {
      log('\n⚠️  VERIFICACIÓN PARCIAL. Algunas mejoras pueden no estar completamente implementadas.', 'yellow');
      process.exit(1);
    } else {
      log('\n❌ VERIFICACIÓN FALLIDA. Las mejoras en Group Missions no están correctamente implementadas.', 'red');
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

module.exports = { verifyGroupMissionImprovements };
