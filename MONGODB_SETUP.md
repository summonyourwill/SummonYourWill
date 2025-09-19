# Configuración de MongoDB para SummonYourWill

Este documento explica cómo se ha configurado MongoDB para futuras actualizaciones del juego.

## 📁 Estructura Creada

```
src/
  main/
    db.ts                    # Conexión a MongoDB
    persist.ts               # APIs de alto nivel para guardado
    ipc.ts                   # Handlers IPC para comunicación renderer-main
    watchers.ts              # Sistema de sincronización automática
    integration-example.ts   # Ejemplo de integración
    sinks/
      fileSink.ts            # Guardado a archivos JSON
      mongoSink.ts           # Guardado a MongoDB
      compositeSink.ts       # Guardado simultáneo a archivo y MongoDB
    repos/
      heroesRepo.ts          # Modelo y operaciones de héroes
      petsRepo.ts            # Modelo y operaciones de mascotas
      villainsRepo.ts        # Modelo y operaciones de villanos
      familiarsRepo.ts       # Modelo y operaciones de familiares
      partnerRepo.ts         # Modelo y operaciones de compañeros
      villageChiefRepo.ts    # Modelo y operaciones del jefe de aldea
scripts/
  seedFromFiles.ts           # Script de importación inicial desde JSON
.env                        # Configuración de MongoDB (no subir al repo)
```

## 🚀 Instalación Completada

✅ Dependencias instaladas:
- `mongodb` - Driver oficial de MongoDB
- `mongoose` - ODM para MongoDB
- `chokidar` - Sistema de watchers para archivos
- `dotenv` - Gestión de variables de entorno
- `@types/node` - Tipos de TypeScript para Node.js

✅ Archivo `.env` creado con:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=SummonYourWill
```

## 🔧 Próximos Pasos

### 1. Instalar MongoDB Localmente
```bash
# Windows (usando Chocolatey)
choco install mongodb

# O descargar desde: https://www.mongodb.com/try/download/community
```

### 2. Iniciar MongoDB
```bash
# Windows
net start MongoDB

# O ejecutar manualmente
mongod
```

### 3. Integrar en main.cjs

Agrega estas líneas a tu `main.cjs`:

```javascript
// Al inicio del archivo
const { initializeMongoDB, cleanupMongoDB } = requireFromApp('main', 'integration-example');

// En app.whenReady(), después de crear la ventana
await initializeMongoDB();

// En app.on('before-quit'), antes de cerrar
await cleanupMongoDB();
```

### 4. Actualizar preload.cjs

Agrega estas funciones a tu `preload.cjs`:

```javascript
contextBridge.exposeInMainWorld('SYW', {
  // ... tus funciones existentes ...
  saveHeroes: (heroes) => ipcRenderer.invoke('save:heroes', heroes),
  savePets: (pets) => ipcRenderer.invoke('save:pets', pets),
  saveVillains: (villains) => ipcRenderer.invoke('save:villains', villains),
  saveFamiliars: (familiars) => ipcRenderer.invoke('save:familiars', familiars),
  savePartner: (partner) => ipcRenderer.invoke('save:partner', partner),
  saveVillageChief: (vc) => ipcRenderer.invoke('save:villagechief', vc),
  saveSave: (save) => ipcRenderer.invoke('save:save', save),
});
```

### 5. Migrar Código de Guardado

En tu código del renderer, reemplaza:

```javascript
// Antes:
fs.writeFileSync('heroes.json', JSON.stringify(heroes));

// Después:
window.SYW.saveHeroes(heroes);

// Para archivos únicos (partner, villagechief, save):
window.SYW.savePartner(partnerData);
window.SYW.saveVillageChief(villageChiefData);
window.SYW.saveSave(saveData);
```

### 6. Importar Datos Existentes

Ejecuta el script de importación inicial:

```bash
# Si tienes ts-node instalado
npx ts-node scripts/seedFromFiles.ts

# O compila y ejecuta
npx tsc scripts/seedFromFiles.ts
node scripts/seedFromFiles.js
```

## 🎯 Características del Sistema

### Guardado Dual
- **Archivo JSON**: Mantiene compatibilidad con el sistema actual
- **MongoDB**: Permite consultas avanzadas y escalabilidad futura

### Estrategia de Guardado MongoDB
- **Colecciones múltiples** (heroes, pets, villains, familiars): Cada entidad se guarda con su propio `_id` usando `replaceOne({ _id: entityId }, data, { upsert: true })`
- **Documentos únicos** (partner, villagechief, save): Se guardan con `_id: "single"` usando `replaceOne({ _id: "single" }, data, { upsert: true })`
- **Base de datos**: `SummonYourWillDB` (configurable en `.env`)

### Sincronización Automática
- Los watchers detectan cambios en archivos JSON y los sincronizan automáticamente con MongoDB
- Útil como red de seguridad para cambios directos a archivos

### APIs de Alto Nivel
- `saveHeroes(heroes)` - Guarda héroes (colección múltiple)
- `savePets(pets)` - Guarda mascotas (colección múltiple)
- `saveVillains(villains)` - Guarda villanos (colección múltiple)
- `saveFamiliars(familiars)` - Guarda familiares (colección múltiple)
- `savePartner(partner)` - Guarda compañero (documento único)
- `saveVillageChief(vc)` - Guarda jefe de aldea (documento único)
- `saveSave(save)` - Guarda datos de guardado (documento único)

### Comunicación Segura
- IPC handlers registrados en el proceso principal
- Comunicación segura entre renderer y main process
- No acceso directo a archivos/MongoDB desde el renderer

## 🔍 Monitoreo

El sistema incluye logging detallado:
- `[Mongo] Conectado a SummonYourWill` - Conexión exitosa
- `[IPC] Handlers de MongoDB registrados` - IPC configurado
- `[Watcher] heroes → Mongo actualizado` - Sincronización automática
- `✓ Héroes importados` - Importación exitosa

## 🛠️ Solución de Problemas

### MongoDB no se conecta
1. Verifica que MongoDB esté ejecutándose: `net start MongoDB`
2. Revisa la URI en `.env`: `mongodb://localhost:27017`
3. Verifica que el puerto 27017 esté libre

### Errores de importación
1. Verifica que los archivos JSON existan en la ruta configurada
2. Revisa los permisos de lectura de archivos
3. Ejecuta el script con permisos de administrador si es necesario

### Watchers no funcionan
1. Verifica que la ruta base esté correcta en `watchers.ts`
2. Asegúrate de que los archivos JSON existan
3. Revisa los permisos de escritura en el directorio

## 📝 Notas Adicionales

- El archivo `.env` no debe subirse al repositorio (ya está en `.gitignore`)
- Para producción, considera usar MongoDB Atlas en lugar de instalación local
- El sistema es tolerante a fallos: si MongoDB no está disponible, solo se guarda en archivo
- Los IDs estables evitan duplicados al importar datos existentes
