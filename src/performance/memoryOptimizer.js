// Optimizador de memoria para reducir uso de RAM
// Mantiene el rendimiento mientras optimiza el uso de memoria

import { performanceMonitor } from './missionOptimizer.js';

// Configuración de optimización de memoria
const MEMORY_OPTIMIZATION_CONFIG = {
  // Umbrales de memoria (en MB)
  lowMemoryThreshold: 50,    // 50MB - activar optimizaciones básicas
  mediumMemoryThreshold: 100, // 100MB - activar optimizaciones moderadas
  highMemoryThreshold: 200,   // 200MB - activar optimizaciones agresivas
  
  // Intervalos de limpieza (en ms)
  cleanupInterval: 30000,     // 30 segundos
  aggressiveCleanupInterval: 10000, // 10 segundos cuando hay mucha memoria
  
  // Configuración de pools
  maxPoolSize: 20,           // Tamaño máximo de pools de elementos
  maxCacheSize: 50,          // Tamaño máximo de caches
  
  // Configuración de timers
  maxTimers: 100,            // Máximo número de timers activos
  timerCleanupInterval: 60000, // Limpiar timers cada minuto
  
  // Configuración de event listeners
  maxEventListeners: 200,    // Máximo número de event listeners
  
  // Configuración de arrays
  maxArraySize: 1000,        // Tamaño máximo de arrays antes de optimizar
  
  // Configuración de objetos
  maxObjectKeys: 100,        // Máximo número de claves en objetos
};

// Monitoreo de memoria
class MemoryMonitor {
  constructor() {
    this.memoryHistory = [];
    this.maxHistorySize = 100;
    this.lastCleanup = Date.now();
    this.cleanupCount = 0;
    this.optimizationLevel = 'none'; // none, low, medium, high
  }

  /**
   * Obtiene el uso actual de memoria
   */
  getCurrentMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize / (1024 * 1024), // MB
        total: performance.memory.totalJSHeapSize / (1024 * 1024), // MB
        limit: performance.memory.jsHeapSizeLimit / (1024 * 1024), // MB
        percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  /**
   * Registra el uso de memoria
   */
  recordMemoryUsage() {
    const usage = this.getCurrentMemoryUsage();
    if (usage) {
      this.memoryHistory.push({
        timestamp: Date.now(),
        ...usage
      });

      // Mantener solo el historial reciente
      if (this.memoryHistory.length > this.maxHistorySize) {
        this.memoryHistory.shift();
      }

      // Determinar nivel de optimización necesario
      this.updateOptimizationLevel(usage.used);
    }
  }

  /**
   * Actualiza el nivel de optimización basado en el uso de memoria
   */
  updateOptimizationLevel(usedMB) {
    let newLevel = 'none';
    
    if (usedMB >= MEMORY_OPTIMIZATION_CONFIG.highMemoryThreshold) {
      newLevel = 'high';
    } else if (usedMB >= MEMORY_OPTIMIZATION_CONFIG.mediumMemoryThreshold) {
      newLevel = 'medium';
    } else if (usedMB >= MEMORY_OPTIMIZATION_CONFIG.lowMemoryThreshold) {
      newLevel = 'low';
    }

    if (newLevel !== this.optimizationLevel) {
      console.log(`🔄 Memory optimization level changed: ${this.optimizationLevel} → ${newLevel} (${usedMB.toFixed(1)}MB)`);
      this.optimizationLevel = newLevel;
    }
  }

  /**
   * Obtiene estadísticas de memoria
   */
  getMemoryStats() {
    const current = this.getCurrentMemoryUsage();
    if (!current) return null;

    const history = this.memoryHistory;
    const avg = history.length > 0 
      ? history.reduce((sum, h) => sum + h.used, 0) / history.length 
      : 0;
    
    const peak = history.length > 0 
      ? Math.max(...history.map(h => h.used)) 
      : 0;

    return {
      current: current,
      average: avg,
      peak: peak,
      history: history.length,
      optimizationLevel: this.optimizationLevel,
      cleanupCount: this.cleanupCount
    };
  }
}

// Optimizador de arrays y objetos
class DataStructureOptimizer {
  constructor() {
    this.optimizedArrays = new WeakSet();
    this.optimizedObjects = new WeakSet();
  }

  /**
   * Optimiza arrays grandes
   */
  optimizeArray(array, maxSize = MEMORY_OPTIMIZATION_CONFIG.maxArraySize) {
    if (!Array.isArray(array) || array.length <= maxSize) return array;
    
    if (this.optimizedArrays.has(array)) return array;
    
    // Crear array optimizado con solo elementos necesarios
    const optimized = array.slice(0, maxSize);
    
    // Reemplazar el array original
    array.length = 0;
    array.push(...optimized);
    
    this.optimizedArrays.add(array);
    console.log(`📊 Array optimized: ${array.length} → ${optimized.length} elements`);
    
    return array;
  }

  /**
   * Optimiza objetos con muchas claves
   */
  optimizeObject(obj, maxKeys = MEMORY_OPTIMIZATION_CONFIG.maxObjectKeys) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    
    if (this.optimizedObjects.has(obj)) return obj;
    
    const keys = Object.keys(obj);
    if (keys.length <= maxKeys) return obj;
    
    // Mantener solo las claves más importantes
    const importantKeys = keys.slice(0, maxKeys);
    const optimized = {};
    
    importantKeys.forEach(key => {
      optimized[key] = obj[key];
    });
    
    // Limpiar objeto original
    Object.keys(obj).forEach(key => {
      if (!importantKeys.includes(key)) {
        delete obj[key];
      }
    });
    
    this.optimizedObjects.add(obj);
    console.log(`📊 Object optimized: ${keys.length} → ${importantKeys.length} keys`);
    
    return obj;
  }

  /**
   * Optimiza estructuras de datos anidadas
   */
  optimizeNestedStructures(data, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return data;
    
    if (Array.isArray(data)) {
      return this.optimizeArray(data);
    } else if (data && typeof data === 'object') {
      return this.optimizeObject(data);
    }
    
    return data;
  }
}

// Optimizador de timers
class TimerOptimizer {
  constructor() {
    this.activeTimers = new Set();
    this.timerCount = 0;
  }

  /**
   * Registra un timer activo
   */
  registerTimer(timer) {
    this.activeTimers.add(timer);
    this.timerCount++;
    
    // Limpiar timers si hay demasiados
    if (this.timerCount > MEMORY_OPTIMIZATION_CONFIG.maxTimers) {
      this.cleanupExcessTimers();
    }
  }

  /**
   * Desregistra un timer
   */
  unregisterTimer(timer) {
    if (this.activeTimers.has(timer)) {
      this.activeTimers.delete(timer);
      this.timerCount--;
    }
  }

  /**
   * Limpia timers excesivos
   */
  cleanupExcessTimers() {
    const excess = this.timerCount - MEMORY_OPTIMIZATION_CONFIG.maxTimers;
    if (excess <= 0) return;
    
    console.log(`⏰ Cleaning up ${excess} excess timers`);
    
    // Limpiar timers más antiguos
    const timersArray = Array.from(this.activeTimers);
    const toRemove = timersArray.slice(0, excess);
    
    toRemove.forEach(timer => {
      if (timer && typeof timer.cleanup === 'function') {
        timer.cleanup();
      }
      this.unregisterTimer(timer);
    });
  }

  /**
   * Obtiene estadísticas de timers
   */
  getTimerStats() {
    return {
      active: this.timerCount,
      maxAllowed: MEMORY_OPTIMIZATION_CONFIG.maxTimers,
      excess: Math.max(0, this.timerCount - MEMORY_OPTIMIZATION_CONFIG.maxTimers)
    };
  }
}

// Optimizador de event listeners
class EventListenerOptimizer {
  constructor() {
    this.registeredListeners = new Map();
    this.listenerCount = 0;
  }

  /**
   * Registra un event listener
   */
  registerListener(element, eventType, handler, key = null) {
    const listenerKey = key || `${element.id || 'unknown'}_${eventType}`;
    
    if (this.registeredListeners.has(listenerKey)) {
      // Reemplazar listener existente
      const oldData = this.registeredListeners.get(listenerKey);
      oldData.element.removeEventListener(oldData.eventType, oldData.handler);
      this.listenerCount--;
    }
    
    this.registeredListeners.set(listenerKey, { element, eventType, handler });
    this.listenerCount++;
    
    // Limpiar listeners si hay demasiados
    if (this.listenerCount > MEMORY_OPTIMIZATION_CONFIG.maxEventListeners) {
      this.cleanupExcessListeners();
    }
  }

  /**
   * Desregistra un event listener
   */
  unregisterListener(key) {
    if (this.registeredListeners.has(key)) {
      const data = this.registeredListeners.get(key);
      data.element.removeEventListener(data.eventType, data.handler);
      this.registeredListeners.delete(key);
      this.listenerCount--;
    }
  }

  /**
   * Limpia listeners excesivos
   */
  cleanupExcessListeners() {
    const excess = this.listenerCount - MEMORY_OPTIMIZATION_CONFIG.maxEventListeners;
    if (excess <= 0) return;
    
    console.log(`🎧 Cleaning up ${excess} excess event listeners`);
    
    // Limpiar listeners más antiguos
    const keys = Array.from(this.registeredListeners.keys());
    const toRemove = keys.slice(0, excess);
    
    toRemove.forEach(key => {
      this.unregisterListener(key);
    });
  }

  /**
   * Obtiene estadísticas de listeners
   */
  getListenerStats() {
    return {
      active: this.listenerCount,
      maxAllowed: MEMORY_OPTIMIZATION_CONFIG.maxEventListeners,
      excess: Math.max(0, this.listenerCount - MEMORY_OPTIMIZATION_CONFIG.maxEventListeners)
    };
  }
}

// Optimizador de caches
class CacheOptimizer {
  constructor() {
    this.caches = new Map();
  }

  /**
   * Registra un cache para optimización
   */
  registerCache(name, cache, maxSize = MEMORY_OPTIMIZATION_CONFIG.maxCacheSize) {
    this.caches.set(name, { cache, maxSize, originalSize: maxSize });
  }

  /**
   * Optimiza todos los caches registrados
   */
  optimizeCaches() {
    this.caches.forEach((cacheInfo, name) => {
      const { cache, maxSize } = cacheInfo;
      
      if (cache && typeof cache.size === 'number' && cache.size > maxSize) {
        // Reducir tamaño del cache
        if (cache instanceof Map || cache instanceof Set) {
          const entries = Array.from(cache.entries() || cache.values());
          const toKeep = entries.slice(0, maxSize);
          
          cache.clear();
          if (cache instanceof Map) {
            toKeep.forEach(([key, value]) => cache.set(key, value));
          } else {
            toKeep.forEach(value => cache.add(value));
          }
          
          console.log(`🗂️ Cache ${name} optimized: ${entries.length} → ${toKeep.length} items`);
        }
      }
    });
  }

  /**
   * Ajusta tamaños de cache basado en nivel de optimización
   */
  adjustCacheSizes(optimizationLevel) {
    this.caches.forEach((cacheInfo, name) => {
      let newSize = cacheInfo.originalSize;
      
      switch (optimizationLevel) {
        case 'high':
          newSize = Math.floor(cacheInfo.originalSize * 0.3); // 30% del tamaño original
          break;
        case 'medium':
          newSize = Math.floor(cacheInfo.originalSize * 0.6); // 60% del tamaño original
          break;
        case 'low':
          newSize = Math.floor(cacheInfo.originalSize * 0.8); // 80% del tamaño original
          break;
      }
      
      cacheInfo.maxSize = newSize;
    });
  }
}

// Clase principal del optimizador de memoria
export class MemoryOptimizer {
  constructor() {
    this.monitor = new MemoryMonitor();
    this.dataOptimizer = new DataStructureOptimizer();
    this.timerOptimizer = new TimerOptimizer();
    this.listenerOptimizer = new EventListenerOptimizer();
    this.cacheOptimizer = new CacheOptimizer();
    
    this.optimizationEnabled = false;
    this.cleanupInterval = null;
    this.aggressiveCleanupInterval = null;
  }

  /**
   * Inicializa el optimizador de memoria
   */
  init() {
    if (this.optimizationEnabled) return;
    
    console.log('🧠 Memory Optimizer initialized');
    
    // Configurar monitoreo continuo
    this.startMemoryMonitoring();
    
    // Configurar limpieza automática
    this.startAutoCleanup();
    
    // Registrar caches existentes
    this.registerExistingCaches();
    
    this.optimizationEnabled = true;
  }

  /**
   * Inicia el monitoreo de memoria
   */
  startMemoryMonitoring() {
    // Monitorear memoria cada 5 segundos
    setInterval(() => {
      this.monitor.recordMemoryUsage();
      
      // Aplicar optimizaciones si es necesario
      if (this.monitor.optimizationLevel !== 'none') {
        this.applyOptimizations();
      }
    }, 5000);
  }

  /**
   * Inicia la limpieza automática
   */
  startAutoCleanup() {
    // Limpieza normal cada 30 segundos
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, MEMORY_OPTIMIZATION_CONFIG.cleanupInterval);
    
    // Limpieza agresiva cada 10 segundos cuando hay mucha memoria
    this.aggressiveCleanupInterval = setInterval(() => {
      const usage = this.monitor.getCurrentMemoryUsage();
      if (usage && usage.used >= MEMORY_OPTIMIZATION_CONFIG.mediumMemoryThreshold) {
        this.performAggressiveCleanup();
      }
    }, MEMORY_OPTIMIZATION_CONFIG.aggressiveCleanupInterval);
  }

  /**
   * Registra caches existentes
   */
  registerExistingCaches() {
    // Registrar caches del sistema de optimización
    if (window.heroOptionsCache) {
      this.cacheOptimizer.registerCache('heroOptions', window.heroOptionsCache, 30);
    }
    
    if (window.heroAvailabilityCache) {
      this.cacheOptimizer.registerCache('heroAvailability', window.heroAvailabilityCache, 50);
    }
    
    // Registrar otros caches que puedan existir
    if (window.lru) {
      this.cacheOptimizer.registerCache('lru', window.lru, 30);
    }
  }

  /**
   * Aplica optimizaciones basadas en el nivel actual
   */
  applyOptimizations() {
    const level = this.monitor.optimizationLevel;
    
    switch (level) {
      case 'high':
        this.applyHighLevelOptimizations();
        break;
      case 'medium':
        this.applyMediumLevelOptimizations();
        break;
      case 'low':
        this.applyLowLevelOptimizations();
        break;
    }
  }

  /**
   * Optimizaciones de bajo nivel
   */
  applyLowLevelOptimizations() {
    // Limpiar caches
    this.cacheOptimizer.optimizeCaches();
    
    // Sugerir garbage collection
    if (typeof gc === 'function') {
      setTimeout(() => gc(), 1000);
    }
  }

  /**
   * Optimizaciones de nivel medio
   */
  applyMediumLevelOptimizations() {
    this.applyLowLevelOptimizations();
    
    // Optimizar estructuras de datos
    this.optimizeGameState();
    
    // Limpiar timers excesivos
    this.timerOptimizer.cleanupExcessTimers();
    
    // Limpiar listeners excesivos
    this.listenerOptimizer.cleanupExcessListeners();
  }

  /**
   * Optimizaciones de alto nivel
   */
  applyHighLevelOptimizations() {
    this.applyMediumLevelOptimizations();
    
    // Ajustar tamaños de cache
    this.cacheOptimizer.adjustCacheSizes('high');
    
    // Forzar limpieza agresiva
    this.performAggressiveCleanup();
    
    // Sugerir recarga si es necesario
    const usage = this.monitor.getCurrentMemoryUsage();
    if (usage && usage.percentage > 90) {
      console.warn('⚠️ Memory usage critical (>90%). Consider reloading the application.');
    }
  }

  /**
   * Optimiza el estado del juego
   */
  optimizeGameState() {
    try {
      // Optimizar arrays de héroes
      if (window.state && window.state.heroes) {
        this.dataOptimizer.optimizeArray(window.state.heroes, 100);
      }
      
      // Optimizar misiones
      if (window.state && window.state.missions) {
        this.dataOptimizer.optimizeArray(window.state.missions, 50);
      }
      
      // Optimizar misiones diarias
      if (window.state && window.state.dailyMissions) {
        this.dataOptimizer.optimizeObject(window.state.dailyMissions, 20);
      }
      
      // Optimizar otros arrays grandes
      if (window.companions) {
        this.dataOptimizer.optimizeArray(window.companions, 20);
      }
      
      if (window.farmers) {
        this.dataOptimizer.optimizeArray(window.farmers, 20);
      }
      
      if (window.lumberjacks) {
        this.dataOptimizer.optimizeArray(window.lumberjacks, 20);
      }
      
      if (window.miners) {
        this.dataOptimizer.optimizeArray(window.miners, 20);
      }
      
    } catch (error) {
      console.warn('⚠️ Error optimizing game state:', error);
    }
  }

  /**
   * Realiza limpieza normal
   */
  performCleanup() {
    this.monitor.cleanupCount++;
    
    // Limpiar caches
    this.cacheOptimizer.optimizeCaches();
    
    // Limpiar timers excesivos
    this.timerOptimizer.cleanupExcessTimers();
    
    // Limpiar listeners excesivos
    this.listenerOptimizer.cleanupExcessListeners();
    
    // Sugerir garbage collection
    if (typeof gc === 'function') {
      setTimeout(() => gc(), 1000);
    }
  }

  /**
   * Realiza limpieza agresiva
   */
  performAggressiveCleanup() {
    console.log('🧹 Performing aggressive memory cleanup');
    
    // Limpiar todo
    this.performCleanup();
    
    // Optimizar estado del juego
    this.optimizeGameState();
    
    // Limpiar arrays temporales
    if (window.tempArrays) {
      window.tempArrays.forEach(arr => {
        if (Array.isArray(arr)) {
          arr.length = 0;
        }
      });
    }
    
    // Forzar garbage collection
    if (typeof gc === 'function') {
      gc();
    }
  }

  /**
   * Obtiene estadísticas completas
   */
  getStats() {
    const memoryStats = this.monitor.getMemoryStats();
    const timerStats = this.timerOptimizer.getTimerStats();
    const listenerStats = this.listenerOptimizer.getListenerStats();
    
    return {
      memory: memoryStats,
      timers: timerStats,
      listeners: listenerStats,
      optimizationLevel: this.monitor.optimizationLevel,
      optimizationEnabled: this.optimizationEnabled
    };
  }

  /**
   * Habilita optimizaciones
   */
  enable() {
    if (!this.optimizationEnabled) {
      this.init();
    }
    console.log('✅ Memory optimizations enabled');
  }

  /**
   * Deshabilita optimizaciones
   */
  disable() {
    this.optimizationEnabled = false;
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.aggressiveCleanupInterval) {
      clearInterval(this.aggressiveCleanupInterval);
      this.aggressiveCleanupInterval = null;
    }
    
    console.log('❌ Memory optimizations disabled');
  }

  /**
   * Limpia recursos
   */
  cleanup() {
    this.disable();
    
    // Limpiar todos los caches
    this.cacheOptimizer.caches.clear();
    
    // Limpiar timers
    this.timerOptimizer.activeTimers.clear();
    this.timerOptimizer.timerCount = 0;
    
    // Limpiar listeners
    this.listenerOptimizer.registeredListeners.clear();
    this.listenerOptimizer.listenerCount = 0;
    
    console.log('🧹 Memory Optimizer cleaned up');
  }
}

// Instancia global del optimizador
export const memoryOptimizer = new MemoryOptimizer();

// API simplificada
export const MemoryOptimizerAPI = {
  enable: () => memoryOptimizer.enable(),
  disable: () => memoryOptimizer.disable(),
  getStats: () => memoryOptimizer.getStats(),
  cleanup: () => memoryOptimizer.cleanup(),
  optimize: () => memoryOptimizer.performCleanup(),
  optimizeAggressive: () => memoryOptimizer.performAggressiveCleanup()
};

// Auto-inicializar cuando sea posible
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => memoryOptimizer.init(), 1000);
    });
  } else {
    setTimeout(() => memoryOptimizer.init(), 1000);
  }
}

// Exponer API global para debugging
if (typeof window !== 'undefined') {
  window.MemoryOptimizer = MemoryOptimizerAPI;
  window.memoryOptimizer = memoryOptimizer;
  
  console.log('🧠 Memory Optimizer API disponible en consola:');
  console.log('   • MemoryOptimizer');
  console.log('   • memoryOptimizer');
}
