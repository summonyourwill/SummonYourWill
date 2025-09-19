#!/usr/bin/env node

/**
 * Script para corregir las rutas de importación en los archivos JavaScript
 * para que funcionen correctamente en producción
 */

import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildSrcDir = path.join(__dirname, '..', 'build-src');

// Mapeo de rutas que necesitan ser corregidas
const pathMappings = [
  // Solo corregir rutas que apuntan a ./src/ -> ./
  { from: './src/', to: './' }
];

async function fixImportPaths() {
  try {
    console.log('🔧 Corrigiendo rutas de importación...');
    
    // Buscar todos los archivos JavaScript de forma recursiva en build-src
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
    const filesAbs = await walk(buildSrcDir);
    const filesToProcess = filesAbs
      // Evitar tocar login.js si existiera
      .filter(p => !p.endsWith(path.sep + 'login.js'));
    
    let totalFilesProcessed = 0;
    let totalReplacements = 0;
    
    for (const filePath of filesToProcess) {
      const content = await fs.readFile(filePath, 'utf8');
      let modifiedContent = content;
      let fileReplacements = 0;
      
      // Aplicar todas las correcciones de rutas
      for (const mapping of pathMappings) {
        // Buscar y reemplazar solo rutas que empiecen con el patrón 'from'
        const escapedFrom = mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Buscar patrones como: from './src/algo.js' o export * from './src/algo.js'
        const patterns = [
          // Para import ... from
          `(from\\s+)(['"])${escapedFrom}([^'"]+)\\2`,
          // Para export * from
          `(export\\s+\\*\\s+from\\s+)(['"])${escapedFrom}([^'"]+)\\2`
        ];
        
        for (const pattern of patterns) {
          const regex = new RegExp(pattern, 'g');
          let match;
          while ((match = regex.exec(modifiedContent)) !== null) {
            const [fullMatch, prefix, quote, relativePath] = match;
            const newPath = `${prefix}${quote}${mapping.to}${relativePath}${quote}`;
            modifiedContent = modifiedContent.replace(fullMatch, newPath);
            fileReplacements++;
          }
        }
      }
      
      // Si se hicieron cambios, escribir el archivo
      if (fileReplacements > 0) {
        await fs.writeFile(filePath, modifiedContent, 'utf8');
        console.log(`  ✅ ${path.relative(buildSrcDir, filePath)}: ${fileReplacements} rutas corregidas`);
        totalReplacements += fileReplacements;
      }
      
      totalFilesProcessed++;
    }
    
    console.log(`\n📋 Resumen:`);
    console.log(`  Archivos procesados: ${totalFilesProcessed}`);
    console.log(`  Total de rutas corregidas: ${totalReplacements}`);
    console.log(`\n✅ Rutas de importación corregidas exitosamente.`);
    
  } catch (error) {
    console.error('❌ Error al corregir las rutas de importación:', error);
    process.exit(1);
  }
}

// Ejecutar el script
fixImportPaths();
