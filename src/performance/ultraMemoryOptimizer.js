// Optimizador Ultra-Agresivo para Reducir RAM de 2000MB a 400-800MB
// Específicamente diseñado para aplicaciones con alto consumo de memoria

import { performanceMonitor } from './missionOptimizer.js';

// Configuración ultra-agresiva para 2000MB
const ULTRA_MEMORY_CONFIG = {
  // Umbrales ultra-agresivos (en MB)
  criticalThreshold: 500,     // 500MB - activar optimizaciones críticas
  highThreshold: 800,         // 800MB - activar optimizaciones agresivas
  mediumThreshold: 1200,      // 1200MB - activar optimizaciones moderadas
  lowThreshold: 1500,         // 1500MB - activar optimizaciones básicas
  
  // Limpieza ultra-frecuente
  criticalCleanupInterval: 5000,    // 5 segundos cuando es crítico
  aggressiveCleanupInterval: 10000, // 10 segundos cuando es alto
  normalCleanupInterval: 20000,     // 20 segundos normalmente
  
  // Límites ultra-estrictos
  maxTimers: 20,              // Solo 20 timers activos (vs 100 normal)
  maxEventListeners: 50,      // Solo 50 listeners (vs 200 normal)
  maxArraySize: 100,          // Arrays máximo 100 elementos (vs 1000)
  maxObjectKeys: 30,          // Objetos máximo 30 claves (vs 100)
  maxCacheSize: 10,           // Caches máximo 10 items (vs 50)
  
  // Configuración de pools
  maxPoolSize: 5,             // Pools máximo 5 elementos (vs 20)
  
  // Garbage collection forzado
  forceGCInterval: 10000,     // Forzar GC cada 10 segundos
  aggressiveGCThreshold: 1000 // Forzar GC agresivo si > 1000MB
};

// Monitoreo ultra-agresivo de memoria
class UltraMemoryMonitor {
  constructor() {
    this.memoryHistory = [];
    this.maxHistorySize = 50;
    this.lastCleanup = Date.now();
    this.cleanupCount = 0;
    this.optimizationLevel = 'none'; // none, low, medium, high, critical
    this.gcCount = 0;
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
      
      // Log crítico si es muy alto
      if (usage.used > 1500) {
        console.warn(`🚨 CRITICAL MEMORY USAGE: ${usage.used.toFixed(1)}MB (${usage.percentage.toFixed(1)}%)`);
      }
    }
  }

  /**
   * Actualiza el nivel de optimización basado en el uso de memoria
   */
  updateOptimizationLevel(usedMB) {
    let newLevel = 'none';
    
    if (usedMB >= ULTRA_MEMORY_CONFIG.criticalThreshold) {
      newLevel = 'critical';
    } else if (usedMB >= ULTRA_MEMORY_CONFIG.highThreshold) {
      newLevel = 'high';
    } else if (usedMB >= ULTRA_MEMORY_CONFIG.mediumThreshold) {
      newLevel = 'medium';
    } else if (usedMB >= ULTRA_MEMORY_CONFIG.lowThreshold) {
      newLevel = 'low';
    }

    if (newLevel !== this.optimizationLevel) {
      console.log(`🔄 ULTRA Memory optimization level changed: ${this.optimizationLevel} → ${newLevel} (${usedMB.toFixed(1)}MB)`);
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
      cleanupCount: this.cleanupCount,
      gcCount: this.gcCount
    };
  }
}

// Optimizador ultra-agresivo de timers
class UltraTimerOptimizer {
  constructor() {
    this.activeTimers = new Set();
    this.timerCount = 0;
    this.timerGroups = new Map();
    this.lastCleanup = Date.now();
  }

  /**
   * Registra un timer activo
   */
  registerTimer(timer, group = 'default') {
    this.activeTimers.add(timer);
    this.timerCount++;
    
    if (!this.timerGroups.has(group)) {
      this.timerGroups.set(group, new Set());
    }
    this.timerGroups.get(group).add(timer);
    
    // Limpiar timers si hay demasiados
    if (this.timerCount > ULTRA_MEMORY_CONFIG.maxTimers) {
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
      
      // Limpiar de grupos
      for (const [group, timers] of this.timerGroups.entries()) {
        if (timers.has(timer)) {
          timers.delete(timer);
          break;
        }
      }
    }
  }

  /**
   * Limpia timers excesivos ultra-agresivamente
   */
  cleanupExcessTimers() {
    const excess = this.timerCount - ULTRA_MEMORY_CONFIG.maxTimers;
    if (excess <= 0) return;
    
    console.log(`⏰ ULTRA Cleaning up ${excess} excess timers (${this.timerCount} → ${ULTRA_MEMORY_CONFIG.maxTimers})`);
    
    // Limpiar timers más antiguos por grupo
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
   * Limpieza ultra-agresiva de timers
   */
  ultraAggressiveCleanup() {
    console.log('🚀 ULTRA Aggressive timer cleanup');
    
    // Limpiar todos los timers excepto los esenciales
    const essentialTimers = Array.from(this.activeTimers).filter(timer => {
      // Mantener solo timers críticos del juego
      return timer && (
        timer.kind === 'mission' || 
        timer.kind === 'hero' || 
        timer.kind === 'game'
      );
    });
    
    // Limpiar el resto
    const toRemove = Array.from(this.activeTimers).filter(timer => 
      !essentialTimers.includes(timer)
    );
    
    toRemove.forEach(timer => {
      if (timer && typeof timer.cleanup === 'function') {
        timer.cleanup();
      }
      this.unregisterTimer(timer);
    });
    
    console.log(`🧹 ULTRA Timer cleanup: ${this.timerCount} timers remaining`);
  }

  /**
   * Obtiene estadísticas de timers
   */
  getTimerStats() {
    return {
      active: this.timerCount,
      maxAllowed: ULTRA_MEMORY_CONFIG.maxTimers,
      excess: Math.max(0, this.timerCount - ULTRA_MEMORY_CONFIG.maxTimers),
      groups: this.timerGroups.size
    };
  }
}

// Optimizador ultra-agresivo de arrays y objetos
class UltraDataStructureOptimizer {
  constructor() {
    this.optimizedArrays = new WeakSet();
    this.optimizedObjects = new WeakSet();
    this.optimizationCount = 0;
  }

  /**
   * Optimiza arrays grandes ultra-agresivamente
   */
  optimizeArray(array, maxSize = ULTRA_MEMORY_CONFIG.maxArraySize) {
    if (!Array.isArray(array) || array.length <= maxSize) return array;
    
    if (this.optimizedArrays.has(array)) return array;
    
    const originalLength = array.length;
    
    // Crear array optimizado con solo elementos esenciales
    const optimized = array.slice(0, maxSize);
    
    // Reemplazar el array original
    array.length = 0;
    array.push(...optimized);
    
    this.optimizedArrays.add(array);
    this.optimizationCount++;
    
    console.log(`📊 ULTRA Array optimized: ${originalLength} → ${optimized.length} elements (${maxSize} max)`);
    
    return array;
  }

  /**
   * Optimiza objetos ultra-agresivamente
   */
  optimizeObject(obj, maxKeys = ULTRA_MEMORY_CONFIG.maxObjectKeys) {
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
    this.optimizationCount++;
    
    console.log(`📊 ULTRA Object optimized: ${keys.length} → ${importantKeys.length} keys (${maxKeys} max)`);
    
    return obj;
  }

  /**
   * Optimización ultra-agresiva del estado del juego
   */
  ultraOptimizeGameState() {
    try {
      console.log('🎯 ULTRA Optimizing game state...');
      
      // Optimizar arrays de héroes ultra-agresivamente
      if (window.state && window.state.heroes) {
        const heroes = window.state.heroes;
        if (heroes.length > 50) { // Solo mantener 50 héroes
          const importantHeroes = heroes.filter(h => 
            h.level > 20 || h.missionTime > 0 || h.trainTime > 0 || h.restTime > 0
          ).slice(0, 50);
          
          if (importantHeroes.length < heroes.length) {
            window.state.heroes = importantHeroes;
            console.log(`🎯 ULTRA Heroes array optimized: ${heroes.length} → ${importantHeroes.length} (50 max)`);
          }
        }
      }
      
      // Optimizar misiones ultra-agresivamente
      if (window.state && window.state.missions) {
        const missions = window.state.missions;
        if (missions.length > 20) { // Solo mantener 20 misiones
          const activeMissions = missions.filter(m => 
            m.heroId || m.completed || m.startTime > Date.now() - 3600000 // Última hora
          ).slice(0, 20);
          
          if (activeMissions.length < missions.length) {
            window.state.missions = activeMissions;
            console.log(`🎯 ULTRA Missions array optimized: ${missions.length} → ${activeMissions.length} (20 max)`);
          }
        }
      }
      
      // Optimizar otros arrays grandes
      const arraysToOptimize = [
        { name: 'companions', array: window.companions, max: 10 },
        { name: 'farmers', array: window.farmers, max: 10 },
        { name: 'lumberjacks', array: window.lumberjacks, max: 10 },
        { name: 'miners', array: window.miners, max: 10 }
      ];
      
      arraysToOptimize.forEach(({ name, array, max }) => {
        if (array && Array.isArray(array) && array.length > max) {
          const originalLength = array.length;
          array.length = max;
          console.log(`🎯 ULTRA ${name} optimized: ${originalLength} → ${max} elements`);
        }
      });
      
    } catch (error) {
      console.warn('⚠️ ULTRA Error optimizing game state:', error);
    }
  }
}

// Clase principal del optimizador ultra-agresivo
export class UltraMemoryOptimizer {
  constructor() {
    this.monitor = new UltraMemoryMonitor();
    this.timerOptimizer = new UltraTimerOptimizer();
    this.dataOptimizer = new UltraDataStructureOptimizer();
    
    this.optimizationEnabled = false;
    this.cleanupInterval = null;
    this.aggressiveCleanupInterval = null;
    this.criticalCleanupInterval = null;
    this.gcInterval = null;
  }

  /**
   * Inicializa el optimizador ultra-agresivo
   */
  init() {
    if (this.optimizationEnabled) return;
    
    console.log('🚀 ULTRA Memory Optimizer initialized for 2000MB → 400-800MB reduction');
    
    // Configurar monitoreo continuo
    this.startMemoryMonitoring();
    
    // Configurar limpieza ultra-frecuente
    this.startUltraCleanup();
    
    // Configurar garbage collection forzado
    this.startForcedGC();
    
    this.optimizationEnabled = true;
  }

  /**
   * Inicia el monitoreo de memoria ultra-frecuente
   */
  startMemoryMonitoring() {
    // Monitorear memoria cada 2 segundos
    setInterval(() => {
      this.monitor.recordMemoryUsage();
      
      // Aplicar optimizaciones si es necesario
      if (this.monitor.optimizationLevel !== 'none') {
        this.applyUltraOptimizations();
      }
    }, 2000);
  }

  /**
   * Inicia la limpieza ultra-frecuente
   */
  startUltraCleanup() {
    // Limpieza crítica cada 5 segundos cuando es crítico
    this.criticalCleanupInterval = setInterval(() => {
      if (this.monitor.optimizationLevel === 'critical') {
        this.performCriticalCleanup();
      }
    }, ULTRA_MEMORY_CONFIG.criticalCleanupInterval);
    
    // Limpieza agresiva cada 10 segundos cuando es alto
    this.aggressiveCleanupInterval = setInterval(() => {
      if (this.monitor.optimizationLevel === 'high') {
        this.performAggressiveCleanup();
      }
    }, ULTRA_MEMORY_CONFIG.aggressiveCleanupInterval);
    
    // Limpieza normal cada 20 segundos
    this.cleanupInterval = setInterval(() => {
      this.performNormalCleanup();
    }, ULTRA_MEMORY_CONFIG.normalCleanupInterval);
  }

  /**
   * Inicia garbage collection forzado
   */
  startForcedGC() {
    this.gcInterval = setInterval(() => {
      const usage = this.monitor.getCurrentMemoryUsage();
      if (usage && usage.used > ULTRA_MEMORY_CONFIG.aggressiveGCThreshold) {
        this.forceGarbageCollection();
      }
    }, ULTRA_MEMORY_CONFIG.forceGCInterval);
  }

  /**
   * Aplica optimizaciones ultra-agresivas basadas en el nivel
   */
  applyUltraOptimizations() {
    const level = this.monitor.optimizationLevel;
    
    switch (level) {
      case 'critical':
        this.applyCriticalOptimizations();
        break;
      case 'high':
        this.applyHighOptimizations();
        break;
      case 'medium':
        this.applyMediumOptimizations();
        break;
      case 'low':
        this.applyLowOptimizations();
        break;
    }
  }

  /**
   * Optimizaciones críticas (≥500MB)
   */
  applyCriticalOptimizations() {
    console.log('🚨 ULTRA Applying CRITICAL optimizations');
    
    // Limpieza ultra-agresiva de timers
    this.timerOptimizer.ultraAggressiveCleanup();
    
    // Optimización ultra-agresiva del estado del juego
    this.dataOptimizer.ultraOptimizeGameState();
    
    // Forzar garbage collection
    this.forceGarbageCollection();
    
    // Limpiar caches agresivamente
    this.clearAllCaches();
    
    // Sugerir recarga si es necesario
    const usage = this.monitor.getCurrentMemoryUsage();
    if (usage && usage.percentage > 95) {
      console.warn('🚨 CRITICAL: Memory usage >95%. Consider reloading the application.');
      this.showCriticalMemoryWarning();
    }
  }

  /**
   * Optimizaciones altas (≥800MB)
   */
  applyHighOptimizations() {
    console.log('🔥 ULTRA Applying HIGH optimizations');
    
    // Limpieza agresiva de timers
    this.timerOptimizer.cleanupExcessTimers();
    
    // Optimización agresiva del estado del juego
    this.dataOptimizer.ultraOptimizeGameState();
    
    // Limpiar caches
    this.clearAllCaches();
    
    // Forzar garbage collection
    this.forceGarbageCollection();
  }

  /**
   * Optimizaciones medias (≥1200MB)
   */
  applyMediumOptimizations() {
    console.log('⚡ ULTRA Applying MEDIUM optimizations');
    
    // Limpieza normal de timers
    this.timerOptimizer.cleanupExcessTimers();
    
    // Optimización del estado del juego
    this.dataOptimizer.ultraOptimizeGameState();
    
    // Limpiar caches
    this.clearAllCaches();
  }

  /**
   * Optimizaciones bajas (≥1500MB)
   */
  applyLowOptimizations() {
    console.log('📊 ULTRA Applying LOW optimizations');
    
    // Solo limpieza básica
    this.clearAllCaches();
  }

  /**
   * Limpieza crítica
   */
  performCriticalCleanup() {
    console.log('🚨 ULTRA Performing CRITICAL cleanup');
    this.monitor.cleanupCount++;
    
    // Aplicar todas las optimizaciones críticas
    this.applyCriticalOptimizations();
  }

  /**
   * Limpieza agresiva
   */
  performAggressiveCleanup() {
    console.log('🔥 ULTRA Performing AGGRESSIVE cleanup');
    this.monitor.cleanupCount++;
    
    // Aplicar optimizaciones altas
    this.applyHighOptimizations();
  }

  /**
   * Limpieza normal
   */
  performNormalCleanup() {
    this.monitor.cleanupCount++;
    
    // Limpieza básica
    this.clearAllCaches();
  }

  /**
   * Fuerza garbage collection
   */
  forceGarbageCollection() {
    this.monitor.gcCount++;
    
    if (typeof gc === 'function') {
      console.log('🗑️ ULTRA Forcing garbage collection');
      gc();
    } else {
      console.log('🗑️ ULTRA Garbage collection not available');
    }
  }

  /**
   * Limpia todos los caches
   */
  clearAllCaches() {
    try {
      // Limpiar caches del sistema
      if (window.heroOptionsCache) {
        window.heroOptionsCache.clear();
      }
      
      if (window.heroAvailabilityCache) {
        window.heroAvailabilityCache.clear();
      }
      
      if (window.lru) {
        window.lru.clear();
      }
      
      // Limpiar caches de imágenes
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      console.log('🗂️ ULTRA All caches cleared');
      
    } catch (error) {
      console.warn('⚠️ ULTRA Error clearing caches:', error);
    }
  }

  /**
   * Muestra advertencia crítica de memoria
   */
  showCriticalMemoryWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff0000;
      color: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 8px 32px rgba(255,0,0,0.5);
      z-index: 10000;
      max-width: 400px;
      font-family: Arial, sans-serif;
      font-size: 16px;
      text-align: center;
    `;
    
    warning.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 15px; font-size: 20px;">🚨 CRITICAL MEMORY USAGE</div>
      <div style="margin-bottom: 20px;">The application is using critical amounts of memory. Consider saving and reloading.</div>
      <button onclick="this.parentElement.remove()" style="
        background: white;
        color: #ff0000;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
      ">Dismiss</button>
    `;
    
    document.body.appendChild(warning);
    
    // Auto-remover después de 15 segundos
    setTimeout(() => {
      if (warning.parentElement) {
        warning.remove();
      }
    }, 15000);
  }

  /**
   * Obtiene estadísticas completas
   */
  getStats() {
    const memoryStats = this.monitor.getMemoryStats();
    const timerStats = this.timerOptimizer.getTimerStats();
    
    return {
      memory: memoryStats,
      timers: timerStats,
      dataOptimizations: this.dataOptimizer.optimizationCount,
      optimizationLevel: this.monitor.optimizationLevel,
      optimizationEnabled: this.optimizationEnabled,
      config: ULTRA_MEMORY_CONFIG
    };
  }

  /**
   * Habilita optimizaciones
   */
  enable() {
    if (!this.optimizationEnabled) {
      this.init();
    }
    console.log('✅ ULTRA Memory optimizations enabled');
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
    
    if (this.criticalCleanupInterval) {
      clearInterval(this.criticalCleanupInterval);
      this.criticalCleanupInterval = null;
    }
    
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
    
    console.log('❌ ULTRA Memory optimizations disabled');
  }

  /**
   * Limpia recursos
   */
  cleanup() {
    this.disable();
    
    // Limpiar timers
    this.timerOptimizer.activeTimers.clear();
    this.timerOptimizer.timerCount = 0;
    
    console.log('🧹 ULTRA Memory Optimizer cleaned up');
  }
}

// Instancia global del optimizador ultra-agresivo
export const ultraMemoryOptimizer = new UltraMemoryOptimizer();

// API simplificada
export const UltraMemoryOptimizerAPI = {
  enable: () => ultraMemoryOptimizer.enable(),
  disable: () => ultraMemoryOptimizer.disable(),
  getStats: () => ultraMemoryOptimizer.getStats(),
  cleanup: () => ultraMemoryOptimizer.cleanup(),
  optimize: () => ultraMemoryOptimizer.performNormalCleanup(),
  optimizeAggressive: () => ultraMemoryOptimizer.performAggressiveCleanup(),
  optimizeCritical: () => ultraMemoryOptimizer.performCriticalCleanup()
};

// Auto-inicializar cuando sea posible
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => ultraMemoryOptimizer.init(), 1000);
    });
  } else {
    setTimeout(() => ultraMemoryOptimizer.init(), 1000);
  }
}

// Exponer API global para debugging
if (typeof window !== 'undefined') {
  window.UltraMemoryOptimizer = UltraMemoryOptimizerAPI;
  window.ultraMemoryOptimizer = ultraMemoryOptimizer;
  
  console.log('🚀 ULTRA Memory Optimizer API disponible en consola:');
  console.log('   • UltraMemoryOptimizer');
  console.log('   • ultraMemoryOptimizer');
  console.log('   • Optimización ultra-agresiva para 2000MB → 400-800MB');
}
