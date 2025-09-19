// Optimizador conservador para el sistema de misiones
// Mantiene la funcionalidad actual pero mejora el rendimiento gradualmente

// Cache ligero para validaciones frecuentes
const heroValidationCache = new Map();
let lastCacheClean = Date.now();
const CACHE_CLEAN_INTERVAL = 30000; // 30 segundos

// Debouncer simple para evitar múltiples renders
let renderTimeout = null;
const RENDER_DELAY = 16; // ~60fps

/**
 * Limpia el cache automáticamente cada 30 segundos
 */
function cleanCacheIfNeeded() {
  const now = Date.now();
  if (now - lastCacheClean > CACHE_CLEAN_INTERVAL) {
    heroValidationCache.clear();
    lastCacheClean = now;
  }
}

/**
 * Cache optimizado para validaciones de héroes
 * @param {string} cacheKey - Clave única para el cache
 * @param {Function} validationFn - Función de validación a cachear
 * @returns {*} Resultado de la validación
 */
export function getCachedHeroValidation(cacheKey, validationFn) {
  cleanCacheIfNeeded();
  
  if (heroValidationCache.has(cacheKey)) {
    return heroValidationCache.get(cacheKey);
  }
  
  const result = validationFn();
  heroValidationCache.set(cacheKey, result);
  
  // Limitar tamaño del cache
  if (heroValidationCache.size > 100) {
    const firstKey = heroValidationCache.keys().next().value;
    heroValidationCache.delete(firstKey);
  }
  
  return result;
}

/**
 * Debouncer conservador para renderizado
 * @param {Function} renderFn - Función de renderizado a ejecutar
 */
export function debouncedRender(renderFn) {
  if (renderTimeout) {
    clearTimeout(renderTimeout);
  }
  
  renderTimeout = setTimeout(() => {
    renderFn();
    renderTimeout = null;
  }, RENDER_DELAY);
}

/**
 * Optimiza la actualización de elementos DOM reutilizando nodos existentes
 * @param {HTMLElement} element - Elemento a optimizar
 * @param {string} newContent - Nuevo contenido
 * @param {string} newClassName - Nueva clase CSS
 */
export function optimizedUpdateElement(element, newContent, newClassName) {
  // Solo actualizar si realmente cambió
  if (element.textContent !== newContent) {
    element.textContent = newContent;
  }
  
  if (element.className !== newClassName) {
    element.className = newClassName;
  }
}

/**
 * Crea un pool de elementos reutilizables para evitar creación constante
 */
class ElementPool {
  constructor(tagName, maxSize = 50) {
    this.tagName = tagName;
    this.maxSize = maxSize;
    this.pool = [];
  }
  
  get() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return document.createElement(this.tagName);
  }
  
  release(element) {
    if (this.pool.length < this.maxSize) {
      // Limpiar el elemento antes de devolverlo al pool
      element.innerHTML = '';
      element.className = '';
      element.removeAttribute('style');
      this.pool.push(element);
    }
  }
}

// Pools para elementos comunes
export const divPool = new ElementPool('div');
export const buttonPool = new ElementPool('button');
export const selectPool = new ElementPool('select');
export const optionPool = new ElementPool('option');

/**
 * Función optimizada para verificar si un héroe está disponible
 * @param {Object} hero - Héroe a verificar
 * @param {number} requiredEnergy - Energía requerida
 * @param {Array} missions - Misiones actuales
 * @param {Object} dailyMissions - Misiones diarias
 * @param {boolean} autoClickActive - Si auto-click está activo
 * @param {Array} companions - Compañeros en auto-click
 * @param {Array} farmers - Granjeros en auto-click
 * @param {Array} lumberjacks - Leñadores en auto-click
 * @param {Array} miners - Mineros en auto-click
 * @param {Function} isBusy - Función para verificar si está ocupado
 */
export function isHeroAvailable(hero, requiredEnergy, missions, dailyMissions, autoClickActive, companions, farmers, lumberjacks, miners, isBusy) {
  // Verificaciones rápidas primero
  if (!hero || hero.energia < requiredEnergy || isBusy(hero)) {
    return false;
  }
  
  const cacheKey = `hero_${hero.id}_${requiredEnergy}_${autoClickActive}_${missions.length}_${Object.keys(dailyMissions).length}`;
  
  return getCachedHeroValidation(cacheKey, () => {
    // Verificar si ya está en misiones
    if (missions.some(m => m.heroId === hero.id)) {
      return false;
    }
    
    // Verificar si ya está en misiones diarias
    for (const dayMissions of Object.values(dailyMissions)) {
      if (dayMissions.some(m => m.heroId === hero.id)) {
        return false;
      }
    }
    
    // Verificar auto-click solo si está activo
    if (autoClickActive) {
      if (companions.includes(hero.id) || 
          farmers.includes(hero.id) || 
          lumberjacks.includes(hero.id) || 
          miners.includes(hero.id)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Limpiar cache manualmente cuando sea necesario
 */
export function clearOptimizationCache() {
  heroValidationCache.clear();
  lastCacheClean = Date.now();
}

/**
 * Optimizador de eventos para evitar múltiples listeners
 */
export class EventOptimizer {
  constructor() {
    this.listeners = new Map();
  }
  
  // Agregar listener optimizado que reemplaza automáticamente si ya existe
  addOptimizedListener(element, eventType, handler, key = null) {
    const elementKey = key || `${element.id || 'unknown'}_${eventType}`;
    
    // Remover listener anterior si existe
    if (this.listeners.has(elementKey)) {
      const oldData = this.listeners.get(elementKey);
      oldData.element.removeEventListener(oldData.eventType, oldData.handler);
    }
    
    // Agregar nuevo listener
    element.addEventListener(eventType, handler);
    this.listeners.set(elementKey, { element, eventType, handler });
  }
  
  // Limpiar todos los listeners
  cleanup() {
    for (const [key, data] of this.listeners.entries()) {
      data.element.removeEventListener(data.eventType, data.handler);
    }
    this.listeners.clear();
  }
}

// Instancia global del optimizador de eventos
export const globalEventOptimizer = new EventOptimizer();

/**
 * Monitor de rendimiento simple
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }
  
  start(operation) {
    this.metrics.set(operation, performance.now());
  }
  
  end(operation) {
    const startTime = this.metrics.get(operation);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.delete(operation);
      
      // Solo log si la operación toma más de 16ms (1 frame)
      if (duration > 16) {
        console.warn(`⚠️ Slow operation: ${operation} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    return 0;
  }
}

export const performanceMonitor = new PerformanceMonitor();
