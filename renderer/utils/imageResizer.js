/**
 * Redimensiona una imagen (File o base64) a un tamaño fijo sin compresión.
 * @param {File} file - Imagen original cargada por el usuario.
 * @param {number} width - Ancho deseado (ej: 160).
 * @param {number} height - Alto deseado (ej: 200).
 * @param {function(base64: string)} callback - Devuelve imagen redimensionada en base64.
 */
export function resizeImageToBase64(file, width, height, callback) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const resizedBase64 = canvas.toDataURL('image/png'); // sin compresión
      callback(resizedBase64);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}
