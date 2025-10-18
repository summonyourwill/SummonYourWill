# Cambio en Popup de Confirmación de Cierre

## Resumen de Cambios

Se modificó el comportamiento del popup de confirmación al cerrar la aplicación para que solo guarde el archivo `save.json` en lugar de exportar un JSON a ubicación personalizada.

## Cambios Realizados

### 1. Versión Electron (Modal Personalizado)

**Archivo:** `script.js` (líneas 13775-13799)

**Antes:**
```javascript
openConfirm({
  message: 'Do you want to export your save before exiting?',
  onConfirm: async () => {
    saveGame();
    await exportSave();  // ❌ Abría diálogo para exportar JSON
    // ...
  }
});
```

**Después:**
```javascript
openConfirm({
  message: 'Do you want to save the game before closing?',
  onConfirm: () => {
    saveGame();  // ✅ Solo guarda en save.json automáticamente
    // ...
  }
});
```

### 2. Versión Navegador (Confirm Nativo)

**Archivo:** `script.js` (líneas 13803-13810)

**Antes:**
```javascript
window.addEventListener('beforeunload', () => {
  if (confirm('Save game before exiting?')) {
    saveGame();
    exportSave();  // ❌ Abría diálogo para exportar JSON
  }
});
```

**Después:**
```javascript
window.addEventListener('beforeunload', () => {
  if (confirm('Do you want to save the game before closing?\n\nYes: Save and exit\nNo: Exit without saving')) {
    saveGame();  // ✅ Solo guarda en save.json automáticamente
  }
});
```

## Comportamiento Nuevo

### Al Cerrar la Aplicación (Electron):

1. Se muestra un modal personalizado con el mensaje:
   ```
   Do you want to save the game before closing?
   ```

2. Opciones:
   - **Yes (Confirm)**: Guarda la partida en `..\SummonYourWillSaves\save.json` y cierra
   - **No (Cancel)**: Cierra sin guardar
   - **Return (X)**: Cancela el cierre y vuelve al juego

### Al Cerrar la Aplicación (Navegador):

1. Se muestra un confirm nativo con el mensaje:
   ```
   Do you want to save the game before closing?
   
   Yes: Save and exit
   No: Exit without saving
   ```

2. Opciones:
   - **OK/Yes**: Guarda la partida en localStorage y cierra
   - **Cancel/No**: Cierra sin guardar

## Ubicación del Guardado

El archivo se guarda automáticamente en:
```
..\SummonYourWillSaves\save.json
```

Esta ubicación es manejada por `saveGame()` a través del proceso principal de Electron (`main.cjs`).

## Diferencia con Exportar

- **Antes**: `exportSave()` abría un diálogo para que el usuario elija dónde guardar el archivo JSON
- **Ahora**: `saveGame()` guarda directamente en la ubicación predeterminada sin preguntar

## Archivos Modificados

1. **script.js**
   - Líneas 13778: Cambio de mensaje del modal
   - Líneas 13785-13791: Eliminada llamada a `exportSave()`
   - Líneas 13804: Cambio de mensaje del confirm
   - Líneas 13805: Eliminada llamada a `exportSave()`

2. **build-src/script.js**
   - Actualizado automáticamente con `npm run build:pre`

## Cómo Probar

1. **Abrir la aplicación**
2. **Cerrar la aplicación** (Alt+F4 o botón cerrar)
3. **Verificar el popup:**
   - Debe decir "Do you want to save the game before closing?"
   - No debe abrir ningún diálogo de selección de archivo
4. **Hacer click en Yes/OK**
5. **Verificar que el archivo existe:**
   ```
   ..\SummonYourWillSaves\save.json
   ```
6. **Reabrir la aplicación** y verificar que la partida se cargó correctamente

## Notas

- El cambio afecta tanto a la versión de Electron como a la versión de navegador
- La función `exportSave()` sigue existiendo para uso manual (si hay un botón de exportar en el UI)
- El guardado automático (`scheduleSaveGame()`) no se ve afectado por este cambio

