#!/usr/bin/env node

/**
 * Script de verificación de timers
 * Asegura que NO existan timers sub-minuto en el proyecto
 */

const fs = require('fs');
const glob = require('glob');

// Constantes de tiempo mínimas
const MIN_MS = 60_000; // 1 minuto

// Excepciones justificadas (minijuegos que requieren 1 segundo)
const JUSTIFIED_EXCEPTIONS = [
  'minigames/PomodoroTower.html',
  'src/OtherMinigames/SilenceTemple.html',
  'src/OtherMinigames/GhostFarm.html',
  'src/OtherMinigames/PetExploration.html',
  'src/OtherMinigames/ChiefSurvival.html'
  // NOTA: GiantBoss, EnemyEncounter y FortuneWheel están en script.js
  // pero no tienen timers de setInterval que hayan sido cambiados
];

// Patrones a buscar
const TIMER_PATTERNS = [
  /setInterval\s*\(\s*[^,]+,\s*([0-9]+)\s*\)/g,
  /setInterval\s*\(\s*[^,]+,\s*([0-9]+\s*\*\s*[0-9]+)\s*\)/g,
  /setInterval\s*\(\s*[^,]+,\s*([0-9]+\s*\*\s*[0-9]+\s*\*\s*[0-9]+)\s*\)/g
];

// Archivos a excluir
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/*.min.js',
  '**/*.min.css',
  '**/dist/**',
  '**/build/**',
  '**/*.map',
  '**/TIMER_OPTIMIZATION_IMPLEMENTED.md',
  '**/TIMER_OPTIMIZATION_README.md'
];

// Archivos a incluir
const INCLUDE_PATTERNS = [
  '**/*.js',
  '**/*.jsx',
  '**/*.ts',
  '**/*.tsx',
  '**/*.html'
];

function findTimerFiles() {
  const files = [];
  
  INCLUDE_PATTERNS.forEach(pattern => {
    const matches = glob.sync(pattern, {
      ignore: EXCLUDE_PATTERNS,
      cwd: process.cwd()
    });
    files.push(...matches);
  });
  
  return [...new Set(files)];
}

function checkFileForSubMinuteTimers(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    TIMER_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const intervalStr = match[1];
        
        // Evaluar expresiones matemáticas simples
        let intervalMs;
        try {
          intervalMs = eval(intervalStr);
        } catch {
          // Si no se puede evaluar, buscar números específicos
          const numbers = intervalStr.match(/[0-9]+/g);
          if (numbers) {
            intervalMs = numbers.reduce((a, b) => a * b, 1);
          }
        }
        
        if (intervalMs && intervalMs < MIN_MS) {
          const line = content.substring(0, match.index).split('\n').length;
          
          // Verificar si es una excepción justificada
          const isJustifiedException = JUSTIFIED_EXCEPTIONS.some(exception => 
            filePath.includes(exception)
          );
          
          if (isJustifiedException) {
            issues.push({
              line,
              interval: intervalMs,
              code: match[0].trim(),
              issue: `Timer sub-minuto JUSTIFICADO: ${intervalMs}ms < ${MIN_MS}ms (${filePath})`,
              justified: true
            });
          } else {
            issues.push({
              line,
              interval: intervalMs,
              code: match[0].trim(),
              issue: `Timer sub-minuto: ${intervalMs}ms < ${MIN_MS}ms`
            });
          }
        }
      }
    });
    
    return issues;
  } catch (error) {
    return [{ error: `Error leyendo archivo: ${error.message}` }];
  }
}

function main() {
  console.log('🔍 Verificando timers sub-minuto en el proyecto...\n');
  
  const files = findTimerFiles();
  console.log(`📁 Archivos a revisar: ${files.length}\n`);
  
  let filesWithIssues = 0;
  
  files.forEach(file => {
    const issues = checkFileForSubMinuteTimers(file);
    
    if (issues.length > 0) {
      filesWithIssues++;
      console.log(`❌ ${file}:`);
      
      issues.forEach(issue => {
        if (issue.error) {
          console.log(`   ⚠️  ${issue.error}`);
        } else if (issue.justified) {
          console.log(`   ✅ Línea ${issue.line}: ${issue.issue}`);
          console.log(`   Código: ${issue.code}`);
        } else {
          console.log(`   ❌ Línea ${issue.line}: ${issue.issue}`);
          console.log(`   Código: ${issue.code}`);
        }
      });
      console.log('');
    }
  });
  
  // Resumen
  console.log('📊 RESUMEN DE VERIFICACIÓN:');
  console.log('=' .repeat(50));
  
  // Separar problemas justificados de problemas reales
  const allIssues = [];
  files.forEach(file => {
    const issues = checkFileForSubMinuteTimers(file);
    allIssues.push(...issues);
  });
  
  const justifiedIssues = allIssues.filter(issue => issue.justified).length;
  const realIssues = allIssues.filter(issue => !issue.justified).length;
  
  if (realIssues === 0) {
    console.log('✅ NO se encontraron timers sub-minuto PROBLEMÁTICOS');
    if (justifiedIssues > 0) {
      console.log(`⚠️  Se encontraron ${justifiedIssues} timers sub-minuto JUSTIFICADOS (minijuegos)`);
    }
    console.log('✅ Todos los timers cumplen con las reglas de optimización');
    console.log('✅ Proyecto optimizado correctamente');
  } else {
    console.log(`❌ Se encontraron ${realIssues} problemas REALES en ${filesWithIssues} archivos`);
    if (justifiedIssues > 0) {
      console.log(`⚠️  Se encontraron ${justifiedIssues} timers sub-minuto JUSTIFICADOS (minijuegos)`);
    }
    console.log('❌ Existen timers que no cumplen con el mínimo de 1 minuto');
    console.log('❌ Revisar y corregir los archivos marcados arriba');
  }
  
  console.log('\n🎯 Regla: NO debe existir NINGÚN setInterval menor a 60_000 ms');
  console.log('📝 Ver documentación: TIMER_OPTIMIZATION_IMPLEMENTED.md');
  
  process.exit(realIssues === 0 ? 0 : 1);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { checkFileForSubMinuteTimers, findTimerFiles };
