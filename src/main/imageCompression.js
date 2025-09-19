// src/main/imageCompression.js
const sharp = require('sharp');
const { promises: fs } = require('fs');
const path = require('path');

/**
 * Comprime y redimensiona una imagen usando sharp
 * @param {string} inputPath - Ruta del archivo de entrada
 * @param {string} outputPath - Ruta del archivo de salida
 * @param {number} maxWidth - Ancho máximo (default: 500)
 * @param {number} maxHeight - Alto máximo (default: 500)
 * @param {number} quality - Calidad de compresión (default: 80)
 */
async function compressImage(inputPath, outputPath, maxWidth = 500, maxHeight = 500, quality = 80) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Determinar el formato de salida basado en el formato original
    let outputFormat = metadata.format;
    if (outputFormat === 'jpeg') outputFormat = 'jpg';
    
    // Redimensionar manteniendo la proporción
    const resized = image
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    
    // Aplicar compresión según el formato
    let compressed;
    switch (outputFormat) {
      case 'jpg':
        compressed = resized.jpeg({ quality });
        break;
      case 'png':
        compressed = resized.png({ quality });
        break;
      case 'webp':
        compressed = resized.webp({ quality });
        break;
      default:
        compressed = resized.jpeg({ quality }); // Default to JPEG
    }
    
    await compressed.toFile(outputPath);
    
    const originalSize = (await fs.stat(inputPath)).size;
    const compressedSize = (await fs.stat(outputPath)).size;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ Imagen comprimida: ${path.basename(inputPath)}`);
    console.log(`   Tamaño original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Tamaño comprimido: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(`   Reducción: ${reduction}%`);
    console.log(`   Formato: ${outputFormat}`);
    
    return {
      success: true,
      originalSize,
      compressedSize,
      reduction: parseFloat(reduction),
      format: outputFormat
    };
    
  } catch (error) {
    console.error(`❌ Error comprimiendo imagen ${inputPath}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Comprime una imagen base64 usando sharp
 * @param {string} base64Data - Datos base64 de la imagen
 * @param {number} maxWidth - Ancho máximo (default: 500)
 * @param {number} maxHeight - Alto máximo (default: 500)
 * @param {number} quality - Calidad de compresión (default: 80)
 */
async function compressBase64Image(base64Data, maxWidth = 500, maxHeight = 500, quality = 80) {
  try {
    // Extraer el formato y los datos de la imagen base64
    const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Formato base64 inválido');
    }
    
    const format = matches[1];
    const imageData = Buffer.from(matches[2], 'base64');
    
    // Crear imagen con sharp
    const image = sharp(imageData);
    const metadata = await image.metadata();
    
    // Redimensionar manteniendo la proporción
    const resized = image
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    
    // Aplicar compresión según el formato
    let compressed;
    switch (format) {
      case 'jpeg':
      case 'jpg':
        compressed = resized.jpeg({ quality });
        break;
      case 'png':
        compressed = resized.png({ quality });
        break;
      case 'webp':
        compressed = resized.webp({ quality });
        break;
      default:
        compressed = resized.jpeg({ quality }); // Default to JPEG
    }
    
    const compressedBuffer = await compressed.toBuffer();
    const compressedBase64 = `data:image/${format};base64,${compressedBuffer.toString('base64')}`;
    
    const originalSize = imageData.length;
    const compressedSize = compressedBuffer.length;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ Imagen base64 comprimida`);
    console.log(`   Tamaño original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Tamaño comprimido: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(`   Reducción: ${reduction}%`);
    console.log(`   Formato: ${format}`);
    
    return {
      success: true,
      compressedBase64,
      originalSize,
      compressedSize,
      reduction: parseFloat(reduction),
      format
    };
    
  } catch (error) {
    console.error(`❌ Error comprimiendo imagen base64:`, error.message);
    return {
      success: false,
      error: error.message,
      originalBase64: base64Data
    };
  }
}

/**
 * Comprime todas las imágenes en un objeto de datos del juego
 * @param {Object} gameData - Datos del juego
 * @param {string} dataType - Tipo de datos (villagechief, partner, etc.)
 */
async function compressGameDataImages(gameData, dataType) {
  let totalCompressed = 0;
  let totalReduction = 0;
  
  const compressObject = async (obj, path = '') => {
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          await compressObject(obj[i], `${path}[${i}]`);
        }
      } else {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          // Comprimir campos de imagen conocidos
          if (key === 'img' || key === 'avatar' || key === 'stepImgs') {
            if (typeof value === 'string' && value.startsWith('data:image/')) {
              console.log(`Comprimiendo imagen en ${dataType}.${currentPath}...`);
              const result = await compressBase64Image(value);
              if (result.success) {
                obj[key] = result.compressedBase64;
                totalCompressed++;
                totalReduction += result.reduction;
                console.log(`✅ Imagen comprimida en ${dataType}.${currentPath}`);
              }
            } else if (Array.isArray(value)) {
              // Para stepImgs
              for (let i = 0; i < value.length; i++) {
                if (typeof value[i] === 'string' && value[i].startsWith('data:image/')) {
                  console.log(`Comprimiendo imagen en ${dataType}.${currentPath}[${i}]...`);
                  const result = await compressBase64Image(value[i]);
                  if (result.success) {
                    value[i] = result.compressedBase64;
                    totalCompressed++;
                    totalReduction += result.reduction;
                    console.log(`✅ Imagen comprimida en ${dataType}.${currentPath}[${i}]`);
                  }
                }
              }
            }
          } else if (typeof value === 'object') {
            await compressObject(value, currentPath);
          }
        }
      }
    }
  };
  
  await compressObject(gameData);
  
  if (totalCompressed > 0) {
    const avgReduction = (totalReduction / totalCompressed).toFixed(1);
    console.log(`🎉 Compresión completada para ${dataType}:`);
    console.log(`   Imágenes comprimidas: ${totalCompressed}`);
    console.log(`   Reducción promedio: ${avgReduction}%`);
  }
  
  return {
    totalCompressed,
    averageReduction: totalCompressed > 0 ? totalReduction / totalCompressed : 0
  };
}

module.exports = {
  compressImage,
  compressBase64Image,
  compressGameDataImages
};
