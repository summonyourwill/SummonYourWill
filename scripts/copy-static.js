// scripts/copy-static.js
// Script para copiar archivos estáticos necesarios para el build de producción

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const buildSrcDir = path.join(projectRoot, 'build-src');

async function copyFile(src, dest) {
  try {
    await fs.copyFile(src, dest);
    console.log(`[copy] ${src} -> ${dest}`);
  } catch (error) {
    console.error(`❌ Error copying ${src}:`, error.message);
  }
}

async function copyDirectory(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  } catch {
    console.error(`❌ Error copying directory ${src}`);
  }
}

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // Directory might already exist, ignore error
  }
}

async function copyFileIfNeeded(src, dest) {
  try {
    // Check if destination file exists and is newer than source
    try {
      const destStats = await fs.stat(dest);
      const srcStats = await fs.stat(src);
      
      if (destStats.mtime > srcStats.mtime) {
        console.log(`[copy] Skipping ${src} (destination is newer)`);
        return;
      }
    } catch {
      // Destination file doesn't exist, proceed with copy
    }
    
    await copyFile(src, dest);
  } catch {
    console.error(`❌ Error in copyFileIfNeeded for ${src}`);
  }
}

(async () => {
  console.log('🚀 Starting static files copy...');
  
  // Ensure build-src directory exists
  await ensureDirectoryExists(buildSrcDir);
  
  // Copy CSS files
  await copyFile(path.join(projectRoot, 'style.css'), path.join(buildSrcDir, 'style.css'));
  await copyFile(path.join(projectRoot, 'dark-theme.css'), path.join(buildSrcDir, 'dark-theme.css'));
  
  // Copy renderer styles directory
  await copyDirectory(path.join(projectRoot, 'renderer', 'styles'), path.join(buildSrcDir, 'renderer', 'styles'));
  
  // Copy main application files (only if they don't exist or are older)
  await copyFileIfNeeded(path.join(projectRoot, 'script.js'), path.join(buildSrcDir, 'script.js'));
  await copyFileIfNeeded(path.join(projectRoot, 'package.json'), path.join(buildSrcDir, 'package.json'));
  await copyFileIfNeeded(path.join(projectRoot, 'index.html'), path.join(buildSrcDir, 'index.html'));
  // Ensure partida0.json is available beside build-src/index.html for production fetch
  await copyFileIfNeeded(path.join(projectRoot, 'partida0.json'), path.join(buildSrcDir, 'partida0.json'));
  
  // Copy minigame files
  await copyFile(path.join(projectRoot, 'IdleBossRush.html'), path.join(buildSrcDir, 'idlebossrush.html'));
  await copyFile(path.join(projectRoot, 'idlebossrush.css'), path.join(buildSrcDir, 'idlebossrush.css'));
  await copyFile(path.join(projectRoot, 'idlebossrush.js'), path.join(buildSrcDir, 'idlebossrush.js'));
  
  // Copy minigames directory
  await copyDirectory(path.join(projectRoot, 'minigames'), path.join(buildSrcDir, 'minigames'));
  
  // Copy lib directory
  await copyDirectory(path.join(projectRoot, 'lib'), path.join(buildSrcDir, 'lib'));
  
  // Copy performance directory
  await copyDirectory(path.join(projectRoot, 'performance'), path.join(buildSrcDir, 'performance'));
  
  // Copy ui directory
  await copyDirectory(path.join(projectRoot, 'ui'), path.join(buildSrcDir, 'ui'));
  
  // Copy utils directory
  await copyDirectory(path.join(projectRoot, 'utils'), path.join(buildSrcDir, 'utils'));

  // Copy assets directory to preserve relative paths in production (build-src/index.html -> assets/...)
  await copyDirectory(path.join(projectRoot, 'assets'), path.join(buildSrcDir, 'assets'));
  
  // Copy additional config files
  await copyFile(path.join(projectRoot, 'main.cjs'), path.join(buildSrcDir, 'main.cjs'));
  await copyFile(path.join(projectRoot, 'preload.cjs'), path.join(buildSrcDir, 'preload.cjs'));
  await copyFile(path.join(projectRoot, 'server.cjs'), path.join(buildSrcDir, 'server.cjs'));
  await copyFile(path.join(projectRoot, 'logger.cjs'), path.join(buildSrcDir, 'logger.cjs'));
  await copyFile(path.join(projectRoot, 'constructionWorker.js'), path.join(buildSrcDir, 'constructionWorker.js'));
  // Copy scripts directory items needed by dynamic imports
  await copyDirectory(path.join(projectRoot, 'scripts'), path.join(buildSrcDir, 'scripts'));
  
  // Copy core directory
  await copyDirectory(path.join(projectRoot, 'core'), path.join(buildSrcDir, 'core'));
  
  console.log('✅ Static files copy completed successfully!');
  console.log('📁 build-src directory is now ready for packaging');
})().catch(error => {
  console.error('❌ Error during copy:', error);
  process.exit(1);
});

