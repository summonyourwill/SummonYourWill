// scripts/migrationManager.js
/* eslint-env browser */
/* global villageChief, partner, heroes, villains, pets, saveGame */
// Función para comprimir una imagen base64 a 500x500px usando sharp (versión para el navegador)
async function compressBase64ImageWithSharp(base64String) {
  if (!base64String || base64String.length < 100) {
    return base64String;
  }

  try {
    // En el navegador, usamos la función de compresión existente como fallback
    // ya que sharp no está disponible en el renderer process
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        canvas.width = 500;
        canvas.height = 500;
        ctx.drawImage(img, 0, 0, 500, 500);
        const compressedBase64 = canvas.toDataURL('image/png');
        resolve(compressedBase64);
      };
      
      img.onerror = function() {
        resolve(base64String);
      };
      
      img.src = base64String;
    });
  } catch (error) {
    console.error('Error comprimiendo imagen:', error);
    return base64String;
  }
}

// Función para comprimir imágenes en un objeto (versión asíncrona)
async function compressImagesInObject(obj, path = '') {
  let hasChanges = false;
  
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      for (let index = 0; index < obj.length; index++) {
        const itemPath = `${path}[${index}]`;
        if (await compressImagesInObject(obj[index], itemPath)) {
          hasChanges = true;
        }
      }
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Comprimir campos de imagen conocidos
        if (key === 'img' || key === 'avatar' || key === 'stepImgs') {
          if (typeof value === 'string' && value.startsWith('data:image/')) {
            console.log(`Comprimiendo imagen en ${currentPath}...`);
            const compressed = await compressBase64ImageWithSharp(value);
            if (compressed !== value) {
              obj[key] = compressed;
              hasChanges = true;
              console.log(`✅ Imagen comprimida en ${currentPath}`);
            }
          } else if (Array.isArray(value)) {
            // Para stepImgs
            for (let index = 0; index < value.length; index++) {
              if (typeof value[index] === 'string' && value[index].startsWith('data:image/')) {
                console.log(`Comprimiendo imagen en ${currentPath}[${index}]...`);
                const compressed = await compressBase64ImageWithSharp(value[index]);
                if (compressed !== value[index]) {
                  obj[key][index] = compressed;
                  hasChanges = true;
                  console.log(`✅ Imagen comprimida en ${currentPath}[${index}]`);
                }
              }
            }
          }
        } else if (typeof value === 'object') {
          if (await compressImagesInObject(value, currentPath)) {
            hasChanges = true;
          }
        }
      }
    }
  }
  
  return hasChanges;
}

// Función de migración automática
export async function runImageCompressionMigration() {
  const migrationKey = 'imageCompressionMigration_v1';
  
  // Verificar si ya se ejecutó la migración
  if (localStorage.getItem(migrationKey)) {
    console.log('✅ Migración de compresión de imágenes ya ejecutada');
    return;
  }
  
  console.log('🖼️ Ejecutando migración de compresión de imágenes...');
  
  try {
    let hasChanges = false;
    
    // Comprimir imágenes en villagechief
    if (villageChief) {
      if (await compressImagesInObject(villageChief, 'villagechief')) {
        hasChanges = true;
      }
    }
    
    // Comprimir imágenes en partner
    if (partner) {
      if (await compressImagesInObject(partner, 'partner')) {
        hasChanges = true;
      }
    }
    
    // Comprimir imágenes en heroes
    if (heroes && Array.isArray(heroes)) {
      for (let index = 0; index < heroes.length; index++) {
        if (await compressImagesInObject(heroes[index], `heroes[${index}]`)) {
          hasChanges = true;
        }
      }
    }
    
    // Comprimir imágenes en villains
    if (villains && Array.isArray(villains)) {
      for (let index = 0; index < villains.length; index++) {
        if (await compressImagesInObject(villains[index], `villains[${index}]`)) {
          hasChanges = true;
        }
      }
    }
    
    // Comprimir imágenes en pets
    if (pets && Array.isArray(pets)) {
      for (let index = 0; index < pets.length; index++) {
        if (await compressImagesInObject(pets[index], `pets[${index}]`)) {
          hasChanges = true;
        }
      }
    }
    
    // Comprimir imágenes en familiars
    if (villageChief && villageChief.familiars && Array.isArray(villageChief.familiars)) {
      for (let index = 0; index < villageChief.familiars.length; index++) {
        if (await compressImagesInObject(villageChief.familiars[index], `villageChief.familiars[${index}]`)) {
          hasChanges = true;
        }
      }
    }
    
    if (hasChanges) {
      // Guardar los cambios
      if (typeof saveGame === 'function') {
        saveGame();
        console.log('💾 Cambios guardados');
      }
      
      // Marcar migración como completada
      localStorage.setItem(migrationKey, Date.now().toString());
      console.log('✅ Migración de compresión de imágenes completada');
    } else {
      console.log('⚠️ No se encontraron imágenes para comprimir');
      // Marcar migración como completada aunque no haya cambios
      localStorage.setItem(migrationKey, Date.now().toString());
    }
    
  } catch (error) {
    console.error('❌ Error en la migración de compresión:', error);
  }
}

// Función para verificar si hay imágenes sin comprimir
export function checkUncompressedImages() {
  const migrationKey = 'imageCompressionMigration_v1';
  
  if (localStorage.getItem(migrationKey)) {
    return false; // Ya se ejecutó la migración
  }
  
  // Verificar si hay imágenes grandes (más de 1MB en base64)
  const checkObject = (obj, path = '') => {
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.some((item, index) => checkObject(item, `${path}[${index}]`));
      } else {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (key === 'img' || key === 'avatar' || key === 'stepImgs') {
            if (typeof value === 'string' && value.startsWith('data:image/')) {
              // Una imagen de 500x500px en PNG debería ser menor a 1MB en base64
              if (value.length > 1000000) { // ~1MB
                console.log(`🖼️ Imagen grande encontrada en ${currentPath}: ${(value.length / 1024 / 1024).toFixed(2)}MB`);
                return true;
              }
            } else if (Array.isArray(value)) {
              if (value.some(img => typeof img === 'string' && img.startsWith('data:image/') && img.length > 1000000)) {
                return true;
              }
            }
          } else if (typeof value === 'object') {
            if (checkObject(value, currentPath)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };
  
  let hasUncompressedImages = false;
  
  if (villageChief && checkObject(villageChief, 'villagechief')) hasUncompressedImages = true;
  if (partner && checkObject(partner, 'partner')) hasUncompressedImages = true;
  if (heroes && Array.isArray(heroes) && heroes.some(hero => checkObject(hero, 'heroes'))) hasUncompressedImages = true;
  if (villains && Array.isArray(villains) && villains.some(villain => checkObject(villain, 'villains'))) hasUncompressedImages = true;
  if (pets && Array.isArray(pets) && pets.some(pet => checkObject(pet, 'pets'))) hasUncompressedImages = true;
  if (villageChief && villageChief.familiars && Array.isArray(villageChief.familiars) && villageChief.familiars.some(familiar => checkObject(familiar, 'villageChief.familiars'))) hasUncompressedImages = true;
  
  return hasUncompressedImages;
}

