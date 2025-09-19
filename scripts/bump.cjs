#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Función para obtener la fecha y hora actual en formato YYYY-MM-DD HH:mm:ss
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Función para incrementar la versión según el tipo especificado
function bumpVersion(version, bumpType) {
  const parts = version.split('.');
  if (parts.length !== 3) {
    throw new Error(`Formato de versión inválido: ${version}. Debe ser X.Y.Z`);
  }
  
  const major = parseInt(parts[0]);
  const minor = parseInt(parts[1]);
  const patch = parseInt(parts[2]);
  
  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    throw new Error(`Formato de versión inválido: ${version}. Debe ser X.Y.Z`);
  }
  
  switch (bumpType) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default:
      throw new Error(`Tipo de bump inválido: ${bumpType}. Debe ser 'patch', 'minor' o 'major'`);
  }
}

// Función para mostrar el uso del script
function showUsage() {
  console.log('📖 Uso del script bump:');
  console.log('');
  console.log('  npm run bump patch [mensaje]     # Incrementa patch: 1.0.0 → 1.0.1');
  console.log('  npm run bump minor [mensaje]     # Incrementa minor: 1.0.0 → 1.1.0');
  console.log('  npm run bump major [mensaje]     # Incrementa major: 1.0.0 → 2.0.0');
  console.log('');
  console.log('📝 Ejemplos:');
  console.log('  npm run bump patch');
  console.log('  npm run bump minor "Nueva funcionalidad"');
  console.log('  npm run bump major "Cambio importante"');
  console.log('');
}

// Función principal
async function bumpVersionMain() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const versionsPath = path.join(process.cwd(), 'versions.txt');
    
    // Verificar argumentos
    const bumpType = process.argv[2];
    const userMessage = process.argv[3] || 'Versión incrementada automáticamente';
    
    // Validar tipo de bump
    if (!bumpType || !['patch', 'minor', 'major'].includes(bumpType)) {
      console.error('❌ Error: Debe especificar el tipo de bump (patch, minor o major)');
      console.log('');
      showUsage();
      process.exit(1);
    }
    
    // Verificar que package.json existe
    if (!fs.existsSync(packagePath)) {
      console.error('❌ Error: No se encontró package.json en el directorio actual');
      process.exit(1);
    }
    
    // Leer package.json
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageData = JSON.parse(packageContent);
    
    // Obtener versión actual
    const currentVersion = packageData.version;
    console.log(`📦 Versión actual: ${currentVersion}`);
    
    // Incrementar versión según el tipo especificado
    const newVersion = bumpVersion(currentVersion, bumpType);
    console.log(`🚀 Nueva versión: ${newVersion} (${bumpType})`);
    
    // Actualizar package.json
    packageData.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
    console.log(`✅ package.json actualizado con versión ${newVersion}`);
    
    // Obtener fecha y hora actual
    const currentDateTime = getCurrentDateTime();
    
    // Crear línea de versión
    const versionLine = `v${newVersion} - ${currentDateTime}: ${userMessage}`;
    
    // Leer versions.txt si existe, o crear contenido inicial
    let versionsContent = '';
    if (fs.existsSync(versionsPath)) {
      versionsContent = fs.readFileSync(versionsPath, 'utf8');
    }
    
    // Agregar nueva línea al inicio
    const newVersionsContent = versionLine + '\n' + versionsContent;
    
    // Escribir versions.txt
    fs.writeFileSync(versionsPath, newVersionsContent);
    console.log(`✅ versions.txt actualizado`);
    console.log(`📝 Nueva entrada: ${versionLine}`);
    
    console.log('\n🎉 ¡Versión incrementada exitosamente!');
    console.log(`📋 Resumen:`);
    console.log(`   - Versión anterior: ${currentVersion}`);
    console.log(`   - Nueva versión: ${newVersion}`);
    console.log(`   - Tipo de bump: ${bumpType}`);
    console.log(`   - Fecha: ${currentDateTime}`);
    console.log(`   - Mensaje: ${userMessage}`);
    
  } catch (error) {
    console.error('❌ Error durante el bump de versión:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
bumpVersionMain();
