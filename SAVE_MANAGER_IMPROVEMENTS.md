# Mejoras del SaveManager

## Resumen de Cambios

Se ha modificado el archivo `src/core/saveManager.cjs` para que, además de guardar el archivo `save.json` principal, también genere automáticamente **SEIS** archivos JSON adicionales con IDs únicos y referencias cruzadas:

### 1. heroes.json
- **Contenido**: Array completo de héroes del `save.json`
- **Campos adicionales**:
  - `_id`: ID único y aleatorio para cada héroe
  - `chief_id`: Referencia al `_id` del villageChief ⭐ **NUEVO**
- **Ubicación**: Misma carpeta que `save.json`

### 2. pets.json
- **Contenido**: Todas las mascotas extraídas de los héroes
- **Campos adicionales**:
  - `_id`: ID único y aleatorio para cada mascota
  - `id_hero`: Referencia al `_id` del héroe dueño
  - `chief_id`: Referencia al `_id` del villageChief ⭐ **NUEVO**
- **Filtrado**: Solo se incluyen héroes que tengan mascotas (campo `pet` no vacío)
- **Ubicación**: Misma carpeta que `save.json`

### 3. villains.json
- **Contenido**: Array completo de villanos del `save.json`
- **Campos adicionales**:
  - `_id`: ID único y aleatorio para cada villano
  - `chief_id`: Referencia al `_id` del villageChief ⭐ **NUEVO**
- **Ubicación**: Misma carpeta que `save.json`

### 4. villagechief.json ⭐ **MODIFICADO**
- **Contenido**: Datos del villageChief del `save.json`
- **Campo adicional**: `_id` único y aleatorio
- **Propiedades específicas incluidas**:
  - `nivel`: Nivel del villageChief
  - `experiencia`: Experiencia acumulada
  - `imagen`: Avatar/imagen del villageChief
  - `abilities`: Objeto con **SOLO** habilities (❌ **partnerAbilities REMOVIDO**)
  - `inventario`: Objeto con potiones (hp, mana, energy, exp)
  - `stats`: Estadísticas del boss (bossStats)
- **❌ IMPORTANTE**: 
  - El arreglo `familiars` se elimina **COMPLETAMENTE** del objeto resultante
  - El arreglo `partnerAbilities` se remueve del objeto `abilities`
- **Ubicación**: Misma carpeta que `save.json`

### 5. partner.json ⭐ **MODIFICADO**
- **Contenido**: Datos del partner del `save.json`
- **Campos adicionales**:
  - `_id`: ID único y aleatorio
  - `chief_id`: Referencia al `_id` del villageChief ⭐ **NUEVO**
- **Propiedades específicas incluidas**:
  - `nivel`: Nivel del partner
  - `experiencia`: Experiencia acumulada
  - `imagen`: Avatar/imagen del partner
  - `partnerAbilities`: Array con las partnerAbilities del villageChief ⭐ **NUEVO**
  - `inventario`: Objeto con potiones (hp, mana, energy, exp)
  - `stats`: Estadísticas del partner (partnerStats)
- **❌ IMPORTANTE**: 
  - Se remueven los campos `abilities` y `pabilities`
  - Se agrega `partnerAbilities` con las habilidades del villageChief
- **Ubicación**: Misma carpeta que `save.json`

### 6. familiars.json ⭐ **MODIFICADO**
- **Contenido**: Array de familiars del villageChief
- **Campos adicionales**:
  - `_id`: ID único y aleatorio para cada familiar
  - `chief_id`: Referencia al `_id` del villageChief ⭐ **NUEVO**
- **Ubicación**: Misma carpeta que `save.json`

## Funcionalidades Implementadas

### Generación de IDs Únicos
- Función `generateUniqueId()` que crea IDs aleatorios de 26 caracteres
- Formato: combinación de caracteres alfanuméricos en base 36

### Sistema de Referencias Cruzadas ⭐ **NUEVO**
- **Orden de generación**: Se genera primero `villagechief.json` para obtener su `_id`
- **Campo `chief_id`**: Todos los registros (héroes, mascotas, villanos, partner, familiars) incluyen este campo
- **Consistencia**: Todos los archivos referencian al mismo villageChief a través de `chief_id`

### Estructura de Datos de Mascotas
Cada mascota en `pets.json` incluye:
```json
{
  "_id": "id_unico_aleatorio",
  "id_hero": "id_del_heroe_dueno",
  "chief_id": "id_del_villagechief", ⭐ **NUEVO**
  "name": "nombre_mascota",
  "img": "imagen_mascota",
  "level": "nivel_mascota",
  "exp": "experiencia_mascota",
  "origin": "origen_mascota",
  "favorite": "es_favorita",
  "resourceType": "tipo_recurso",
  "pendingCount": "cantidad_pendiente",
  "lastCollection": "ultima_recoleccion",
  "exploreDay": "dia_exploracion",
  "desc": "descripcion_mascota"
}
```

### Estructura de Datos del VillageChief ⭐ **MODIFICADO**
Cada villageChief en `villagechief.json` incluye:
```json
{
  "_id": "id_unico_aleatorio",
  "nivel": "nivel_villagechief",
  "experiencia": "experiencia_villagechief",
  "imagen": "avatar_villagechief",
  "abilities": {
    "habilities": "array_habilidades",
    "partnerAbilities": "array_habilidades_partner"
    // ❌ familiars ELIMINADO de abilities
  },
  "inventario": {
    "hpPotions": "cantidad_pociones_vida",
    "manaPotions": "cantidad_pociones_mana",
    "energyPotions": "cantidad_pociones_energia",
    "expPotions": "cantidad_pociones_experiencia"
  },
  "stats": "estadisticas_boss"
}
```

### Estructura de Datos del Partner ⭐ **MODIFICADO**
Cada partner en `partner.json` incluye:
```json
{
  "_id": "id_unico_aleatorio",
  "chief_id": "id_del_villagechief", ⭐ **NUEVO**
  "nivel": "nivel_partner",
  "experiencia": "experiencia_partner",
  "imagen": "avatar_partner",
  "partnerAbilities": "array_con_partner_abilities_del_villagechief", ⭐ **NUEVO**
  "inventario": {
    "hpPotions": "cantidad_pociones_vida",
    "manaPotions": "cantidad_pociones_mana",
    "energyPotions": "cantidad_pociones_energia",
    "expPotions": "cantidad_pociones_experiencia"
  },
  "stats": "estadisticas_partner"
}
```

### Estructura de Datos de Familiars ⭐ **MODIFICADO**
Cada familiar en `familiars.json` incluye:
```json
{
  "_id": "id_unico_aleatorio",
  "chief_id": "id_del_villagechief", ⭐ **NUEVO**
  "name": "nombre_familiar",
  "img": "imagen_familiar",
  "imgOffset": "offset_imagen",
  "imgOffsetX": "offset_imagen_x",
  "level": "nivel_familiar",
  "desc": "descripcion_familiar",
  "modified": "fecha_modificacion",
  "firstModified": "fecha_primera_modificacion",
  "number": "numero_familiar"
}
```

### Estructura de Datos de Héroes ⭐ **MODIFICADO**
Cada héroe en `heroes.json` incluye:
```json
{
  "_id": "id_unico_aleatorio",
  "chief_id": "id_del_villagechief", ⭐ **NUEVO**
  "id": "id_original_heroe",
  "name": "nombre_heroe",
  "level": "nivel_heroe",
  // ... resto de propiedades del héroe
}
```

### Estructura de Datos de Villanos ⭐ **MODIFICADO**
Cada villano en `villains.json` incluye:
```json
{
  "_id": "id_unico_aleatorio",
  "chief_id": "id_del_villagechief", ⭐ **NUEVO**
  "id": "id_original_villano",
  "name": "nombre_villano",
  "level": "nivel_villano",
  // ... resto de propiedades del villano
}
```

### Manejo de Errores
- Logging detallado de operaciones exitosas y errores
- Fallback graceful si falla la generación de archivos adicionales
- El archivo principal `save.json` se guarda independientemente

## Ubicación de Archivos

Todos los archivos se guardan en:
```
%USERPROFILE%\Documents\SummonYourWillSaves\
```

- `save.json` - Archivo principal de guardado
- `heroes.json` - Héroes con IDs únicos y `chief_id` ⭐
- `pets.json` - Mascotas con referencias a héroes y `chief_id` ⭐
- `villains.json` - Villanos con IDs únicos y `chief_id` ⭐
- `villagechief.json` - VillageChief con ID único, propiedades específicas, **sin familiars y sin partnerAbilities en abilities** ⭐
- `partner.json` - Partner con ID único, propiedades específicas, `chief_id` y **partnerAbilities del villageChief** ⭐
- `familiars.json` - Familiars con IDs únicos y `chief_id` ⭐

## Activación Automática

La funcionalidad se activa automáticamente cada vez que se llama a `saveGame()` desde:
- Cierre de la aplicación (evento `before-quit`)
- Cualquier otra llamada al sistema de guardado

## Flujo de Generación ⭐ **NUEVO**

1. **Primero**: Se genera `villagechief.json` para obtener su `_id`
2. **Segundo**: Se usan todos los demás archivos con el `chief_id` obtenido
3. **Resultado**: Todos los archivos tienen referencias cruzadas consistentes

## Compatibilidad

- **Retrocompatible**: No afecta el funcionamiento existente
- **Incremental**: Solo genera archivos adicionales cuando existen datos
- **Robusto**: Maneja casos donde no hay héroes, mascotas, villanos, villageChief, partner o familiars
- **Consistente**: Todos los archivos referencian al mismo villageChief

## Logs del Sistema

El sistema registra todas las operaciones:
- ✅ Confirmación de archivos generados
- ❌ Errores durante la generación
- 📁 Ubicaciones de archivos generados
- 🔑 ID del villageChief generado

## Notas Técnicas

- Los IDs se generan usando `Math.random()` y conversión a base 36
- Se mantiene la estructura original de datos en `save.json`
- Los archivos adicionales son de solo lectura para el sistema principal
- La generación es asíncrona y no bloquea el guardado principal
- Las propiedades específicas (`nivel`, `experiencia`, `imagen`, `abilities`, `inventario`, `stats`) se mapean desde los campos originales del juego
- **NUEVO**: Se elimina **COMPLETAMENTE** el arreglo `familiars` del `villagechief.json` (ni en abilities ni en el objeto principal)
- **NUEVO**: Se remueve `partnerAbilities` del objeto `abilities` en `villagechief.json`
- **NUEVO**: Se agrega `partnerAbilities` al `partner.json` con **EXACTAMENTE** el mismo contenido que `villageChief.partnerAbilities`
- **NUEVO**: Se remueven los campos `abilities` y `pabilities` del `partner.json`
- **NUEVO**: Se agrega el campo `chief_id` a todos los registros para referencias cruzadas
- **NUEVO**: Se genera primero el villageChief para obtener su ID antes de generar los demás archivos
