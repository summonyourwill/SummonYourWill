#!/usr/bin/env node

/**
 * Script para probar que el build de producción funcione correctamente
 * Verifica que todos los archivos necesarios estén presentes y las rutas sean correctas
 */

import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildSrcDir = path.join(__dirname, '..', 'build-src');

async function testProductionBuild() {
  try {
    console.log('🧪 Probando build de producción...\n');
    
    // Verificar que el directorio build-src existe
    if (!await fs.pathExists(buildSrcDir)) {
      console.error('❌ El directorio build-src no existe. Ejecuta "npm run build:pre" primero.');
      process.exit(1);
    }
    
    // Lista de archivos críticos que deben estar presentes
    const criticalFiles = [
      'script.js',
      'index.html',
      'style.css',
      'Background.png',
      'state.js',
      'index.js',
      'village.js',
      'missions.js',
      'dailyMissions.js',
      'specialBuilderAssignment.js'
    ];
    
    console.log('📁 Verificando archivos críticos...');
    let missingFiles = [];
    
    for (const file of criticalFiles) {
      const filePath = path.join(buildSrcDir, file);
      if (await fs.pathExists(filePath)) {
        console.log(`  ✅ ${file}`);
      } else {
        console.log(`  ❌ ${file} - FALTANTE`);
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      console.error(`\n❌ Faltan ${missingFiles.length} archivos críticos:`, missingFiles.join(', '));
      process.exit(1);
    }
    
    // Verificar que no haya rutas de importación incorrectas
    console.log('\n🔍 Verificando rutas de importación...');
    const walk = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files = [];
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) files.push(...await walk(p));
        else if (e.isFile() && (p.endsWith('.js') || p.endsWith('.cjs'))) files.push(p);
      }
      return files;
    };
    const filesToCheck = (await walk(buildSrcDir))
      .filter(p => !p.endsWith(path.sep + 'script.js') && !p.endsWith(path.sep + 'login.js'));
    
    let incorrectImports = [];
    
    for (const filePath of filesToCheck) {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Buscar importaciones que apunten a ./src/ (excepto entradas principales ya filtradas)
      const srcImports = content.match(/from\s+['"]\.\/src\//g);
      if (srcImports) {
        incorrectImports.push(`${path.relative(buildSrcDir, filePath)}: ${srcImports.length} rutas incorrectas`);
      }
    }
    
    if (incorrectImports.length > 0) {
      console.error('\n❌ Se encontraron rutas de importación incorrectas:');
      incorrectImports.forEach(imp => console.error(`  ${imp}`));
      process.exit(1);
    } else {
      console.log('  ✅ Todas las rutas de importación son correctas');
    }
    
    // Verificar que los directorios necesarios existan
    console.log('\n📂 Verificando directorios necesarios...');
    const requiredDirs = [
      'minigames',
      'performance',
      'renderer',
      'ui',
      'utils',
      'core',
      'missions',
      'dailyMissions',
      'engine',
      'heroes',
      'Buildings',
      'audio',
      'OtherMinigames',
      'Music',
      'system',
      'wrappers',
      'interaction'
    ];
    
    let missingDirs = [];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(buildSrcDir, dir);
      if (await fs.pathExists(dirPath)) {
        console.log(`  ✅ ${dir}/`);
      } else {
        console.log(`  ❌ ${dir}/ - FALTANTE`);
        missingDirs.push(dir);
      }
    }
    
    if (missingDirs.length > 0) {
      console.error(`\n❌ Faltan ${missingDirs.length} directorios necesarios:`, missingDirs.join(', '));
      process.exit(1);
    }
    
    // Verificar que el archivo index.html tenga las rutas correctas
    console.log('\n🌐 Verificando index.html...');
    const indexPath = path.join(buildSrcDir, 'index.html');
    const indexContent = await fs.readFile(indexPath, 'utf8');
    
    if (indexContent.includes('./script.js')) {
      console.log('  ✅ Ruta del script es correcta');
    } else {
      console.error('  ❌ Ruta del script en index.html es incorrecta');
      process.exit(1);
    }
    
    console.log('\n🎉 ¡Build de producción verificado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`  ✅ Archivos críticos: ${criticalFiles.length}/${criticalFiles.length}`);
    console.log(`  ✅ Rutas de importación: Correctas`);
    console.log(`  ✅ Directorios necesarios: ${requiredDirs.length}/${requiredDirs.length}`);
    console.log(`  ✅ index.html: Correcto`);
    
    console.log('\n🚀 El build está listo para producción.');
    
  } catch (error) {
    console.error('❌ Error al probar el build de producción:', error);
    process.exit(1);
  }
}

// Ejecutar el script
testProductionBuild();

