// scripts/compressExistingImages.cjs
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

// Función para comprimir una imagen base64 a 500x500px
function compressBase64Image(base64String, callback) {
  if (!base64String || base64String.length < 100) {
    callback(base64String);
    return;
  }

  // Crear un canvas temporal para comprimir la imagen
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = function() {
    canvas.width = 500;
    canvas.height = 500;
    ctx.drawImage(img, 0, 0, 500, 500);
    const compressedBase64 = canvas.toDataURL('image/png');
    callback(compressedBase64);
  };
  
  img.onerror = function() {
    // Si hay error, devolver la imagen original
    callback(base64String);
  };
  
  img.src = base64String;
}

// Función para comprimir imágenes en un objeto
function compressImagesInObject(obj, path = '') {
  let hasChanges = false;
  
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const itemPath = `${path}[${index}]`;
        if (compressImagesInObject(item, itemPath)) {
          hasChanges = true;
        }
      });
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Comprimir campos de imagen conocidos
        if (key === 'img' || key === 'avatar' || key === 'stepImgs') {
          if (typeof value === 'string' && value.startsWith('data:image/')) {
            console.log(`Comprimiendo imagen en ${currentPath}...`);
            compressBase64Image(value, (compressed) => {
              if (compressed !== value) {
                obj[key] = compressed;
                hasChanges = true;
                console.log(`✅ Imagen comprimida en ${currentPath}`);
              }
            });
          } else if (Array.isArray(value)) {
            // Para stepImgs
            value.forEach((img, index) => {
              if (typeof img === 'string' && img.startsWith('data:image/')) {
                console.log(`Comprimiendo imagen en ${currentPath}[${index}]...`);
                compressBase64Image(img, (compressed) => {
                  if (compressed !== img) {
                    obj[key][index] = compressed;
                    hasChanges = true;
                    console.log(`✅ Imagen comprimida en ${currentPath}[${index}]`);
                  }
                });
              }
            });
          }
        } else if (typeof value === 'object') {
          if (compressImagesInObject(value, currentPath)) {
            hasChanges = true;
          }
        }
      }
    }
  }
  
  return hasChanges;
}

async function compressExistingImages() {
  try {
    console.log('🖼️ Iniciando compresión de imágenes existentes...');
    
    const files = ['villagechief.json', 'partner.json', 'heroes.json', 'villains.json', 'pets.json', 'familiars.json'];
    let totalCompressed = 0;
    
    for (const fileName of files) {
      const filePath = path.join(BASE, fileName);
      
      if (fs.existsSync(filePath)) {
        console.log(`\n📁 Procesando ${fileName}...`);
        
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(data);
          
          let hasChanges = false;
          
          // Comprimir imágenes en el objeto
          if (compressImagesInObject(jsonData)) {
            hasChanges = true;
          }
          
          if (hasChanges) {
            // Crear backup
            const backupPath = path.join(BASE, `${fileName}.backup.${Date.now()}`);
            fs.writeFileSync(backupPath, data);
            console.log(`📦 Backup creado: ${backupPath}`);
            
            // Guardar archivo comprimido
            const compressedJson = JSON.stringify(jsonData, null, 2);
            fs.writeFileSync(filePath, compressedJson, 'utf8');
            
            const originalSize = data.length;
            const compressedSize = compressedJson.length;
            const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
            
            console.log(`✅ ${fileName} comprimido`);
            console.log(`   Tamaño original: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`);
            console.log(`   Tamaño comprimido: ${(compressedSize / (1024 * 1024)).toFixed(2)} MB`);
            console.log(`   Reducción: ${reduction}%`);
            
            totalCompressed++;
          } else {
            console.log(`⚠️ No se encontraron imágenes para comprimir en ${fileName}`);
          }
          
        } catch (error) {
          console.error(`❌ Error procesando ${fileName}:`, error.message);
        }
      } else {
        console.log(`⚠️ Archivo no encontrado: ${fileName}`);
      }
    }
    
    console.log(`\n🎉 Compresión completada. ${totalCompressed} archivos procesados.`);
    
  } catch (error) {
    console.error('❌ Error en la compresión:', error.message);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  compressExistingImages();
}

module.exports = { compressExistingImages, compressBase64Image };

