// Optimizador Integral Completo
// Combina optimizaciones de UI y memoria para rendimiento máximo

import { UIOptimizer, UIOptimizerAPI } from './uiOptimizer.js';
import { MemoryOptimizer, MemoryOptimizerAPI } from './memoryOptimizer.js';
import { performanceMonitor } from './missionOptimizer.js';

// Configuración global de optimizaciones
const COMPREHENSIVE_OPTIMIZATION_CONFIG = {
  // Activación automática
  autoEnable: true,
  autoEnableThreshold: 80, // MB - habilitar automáticamente cuando se supere
  
  // Niveles de optimización
  levels: {
    minimal: {
      memoryThreshold: 50,    // MB
      uiOptimizations: false,
      memoryOptimizations: true,
      description: 'Optimizaciones básicas de memoria'
    },
    balanced: {
      memoryThreshold: 100,   // MB
      uiOptimizations: true,
      memoryOptimizations: true,
      description: 'Balance entre rendimiento y memoria'
    },
    aggressive: {
      memoryThreshold: 200,   // MB
      uiOptimizations: true,
      memoryOptimizations: true,
      aggressiveMemory: true,
      description: 'Optimizaciones agresivas para dispositivos con poca RAM'
    }
  },
  
  // Monitoreo
  monitoringInterval: 10000,  // 10 segundos
  performanceCheckInterval: 30000, // 30 segundos
  
  // Umbrales de rendimiento
  performanceThresholds: {
    renderTime: 50,      // ms
    memoryUsage: 150,    // MB
    fpsThreshold: 30     // FPS mínimo
  }
};

// Clase principal del optimizador integral
export class ComprehensiveOptimizer {
  constructor() {
    this.uiOptimizer = new UIOptimizer();
    this.memoryOptimizer = new MemoryOptimizer();
    
    this.currentLevel = 'minimal';
    this.optimizationsEnabled = false;
    this.monitoringInterval = null;
    this.performanceCheckInterval = null;
    
    this.performanceHistory = [];
    this.maxHistorySize = 50;
    
    this.lastOptimization = Date.now();
    this.optimizationCount = 0;
  }

  /**
   * Inicializa todas las optimizaciones
   */
  init() {
    if (this.optimizationsEnabled) return;
    
    console.log('🚀 Comprehensive Optimizer initializing...');
    
    try {
      // Inicializar optimizador de memoria
      this.memoryOptimizer.init();
      
      // Inicializar optimizador de UI
      this.uiOptimizer.init();
      
      // Configurar monitoreo continuo
      this.startMonitoring();
      
      // Configurar verificaciones de rendimiento
      this.startPerformanceMonitoring();
      
      // Aplicar nivel inicial
      this.applyOptimizationLevel(this.currentLevel);
      
      this.optimizationsEnabled = true;
      console.log('✅ Comprehensive Optimizer initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing Comprehensive Optimizer:', error);
      this.optimizationsEnabled = false;
    }
  }

  /**
   * Inicia el monitoreo continuo
   */
  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.checkAndOptimize();
    }, COMPREHENSIVE_OPTIMIZATION_CONFIG.monitoringInterval);
  }

  /**
   * Inicia el monitoreo de rendimiento
   */
  startPerformanceMonitoring() {
    this.performanceCheckInterval = setInterval(() => {
      this.checkPerformance();
    }, COMPREHENSIVE_OPTIMIZATION_CONFIG.performanceCheckInterval);
  }

  /**
   * Verifica y aplica optimizaciones automáticamente
   */
  checkAndOptimize() {
    if (!this.optimizationsEnabled) return;
    
    const memoryStats = this.memoryOptimizer.getStats();
    if (!memoryStats || !memoryStats.memory) return;
    
    const currentMemory = memoryStats.memory.current.used;
    const newLevel = this.determineOptimalLevel(currentMemory);
    
    if (newLevel !== this.currentLevel) {
      console.log(`🔄 Optimization level changed: ${this.currentLevel} → ${newLevel} (${currentMemory.toFixed(1)}MB)`);
      this.applyOptimizationLevel(newLevel);
      this.currentLevel = newLevel;
    }
    
    // Aplicar optimizaciones específicas si es necesario
    this.applySpecificOptimizations(currentMemory);
  }

  /**
   * Verifica el rendimiento general
   */
  checkPerformance() {
    if (!this.optimizationsEnabled) return;
    
    const memoryStats = this.memoryOptimizer.getStats();
    const uiStats = this.uiOptimizer.getMetrics();
    
    if (memoryStats && memoryStats.memory) {
      const memoryUsage = memoryStats.memory.current.used;
      const memoryPercentage = memoryStats.memory.current.percentage;
      
      // Registrar métricas de rendimiento
      this.recordPerformanceMetrics({
        timestamp: Date.now(),
        memoryUsage,
        memoryPercentage,
        optimizationLevel: this.currentLevel,
        uiOptimizations: uiStats.optimizationsEnabled,
        memoryOptimizations: memoryStats.optimizationEnabled
      });
      
      // Verificar si se necesitan optimizaciones adicionales
      if (memoryUsage > COMPREHENSIVE_OPTIMIZATION_CONFIG.performanceThresholds.memoryUsage) {
        this.triggerPerformanceOptimizations();
      }
    }
  }

  /**
   * Determina el nivel óptimo de optimización
   */
  determineOptimalLevel(memoryUsage) {
    const { levels } = COMPREHENSIVE_OPTIMIZATION_CONFIG;
    
    if (memoryUsage >= levels.aggressive.memoryThreshold) {
      return 'aggressive';
    } else if (memoryUsage >= levels.balanced.memoryThreshold) {
      return 'balanced';
    } else if (memoryUsage >= levels.minimal.memoryThreshold) {
      return 'minimal';
    }
    
    return 'none';
  }

  /**
   * Aplica un nivel específico de optimización
   */
  applyOptimizationLevel(level) {
    const { levels } = COMPREHENSIVE_OPTIMIZATION_CONFIG;
    const config = levels[level];
    
    if (!config) return;
    
    console.log(`⚙️ Applying ${level} optimization level: ${config.description}`);
    
    // Aplicar optimizaciones de memoria
    if (config.memoryOptimizations) {
      if (level === 'aggressive' && config.aggressiveMemory) {
        this.memoryOptimizer.performAggressiveCleanup();
      } else {
        this.memoryOptimizer.performCleanup();
      }
    }
    
    // Aplicar optimizaciones de UI
    if (config.uiOptimizations) {
      this.uiOptimizer.enable();
    } else {
      this.uiOptimizer.disable();
    }
    
    // Configurar niveles de agresividad
    this.configureAggressiveness(level);
    
    this.lastOptimization = Date.now();
    this.optimizationCount++;
  }

  /**
   * Configura el nivel de agresividad de las optimizaciones
   */
  configureAggressiveness(level) {
    switch (level) {
      case 'aggressive':
        // Configuración ultra-agresiva para dispositivos con poca RAM
        this.memoryOptimizer.configure({
          lowMemoryThreshold: 30,
          mediumMemoryThreshold: 60,
          highMemoryThreshold: 100,
          cleanupInterval: 15000,
          aggressiveCleanupInterval: 5000
        });
        
        this.uiOptimizer.configure({
          heroSelectors: { animationDuration: 30, cacheEnabled: true },
          modals: { animationDuration: 80, animationsEnabled: true },
          performanceThreshold: 15
        });
        break;
        
      case 'balanced':
        // Configuración balanceada
        this.memoryOptimizer.configure({
          lowMemoryThreshold: 50,
          mediumMemoryThreshold: 100,
          highMemoryThreshold: 200,
          cleanupInterval: 30000,
          aggressiveCleanupInterval: 10000
        });
        
        this.uiOptimizer.configure({
          heroSelectors: { animationDuration: 100, cacheEnabled: true },
          modals: { animationDuration: 150, animationsEnabled: true },
          performanceThreshold: 30
        });
        break;
        
      case 'minimal':
        // Configuración mínima
        this.memoryOptimizer.configure({
          lowMemoryThreshold: 80,
          mediumMemoryThreshold: 150,
          highMemoryThreshold: 300,
          cleanupInterval: 60000,
          aggressiveCleanupInterval: 30000
        });
        
        this.uiOptimizer.configure({
          heroSelectors: { animationDuration: 150, cacheEnabled: false },
          modals: { animationDuration: 200, animationsEnabled: false },
          performanceThreshold: 50
        });
        break;
    }
  }

  /**
   * Aplica optimizaciones específicas basadas en el uso de memoria
   */
  applySpecificOptimizations(memoryUsage) {
    // Optimizaciones para uso de memoria alto
    if (memoryUsage > 150) {
      // Limpiar caches agresivamente
      this.memoryOptimizer.performAggressiveCleanup();
      
      // Forzar garbage collection si está disponible
      if (typeof gc === 'function') {
        setTimeout(() => gc(), 1000);
      }
    }
    
    // Optimizaciones para uso de memoria medio
    else if (memoryUsage > 100) {
      // Limpiar caches normalmente
      this.memoryOptimizer.performCleanup();
      
      // Optimizar estructuras de datos
      this.optimizeDataStructures();
    }
    
    // Optimizaciones para uso de memoria bajo
    else if (memoryUsage > 50) {
      // Solo limpieza básica
      this.memoryOptimizer.cacheOptimizer.optimizeCaches();
    }
  }

  /**
   * Optimiza estructuras de datos específicas
   */
  optimizeDataStructures() {
    try {
      // Optimizar arrays grandes del juego
      if (window.state && window.state.heroes) {
        const heroes = window.state.heroes;
        if (heroes.length > 100) {
          // Mantener solo los héroes más importantes
          const importantHeroes = heroes.filter(h => 
            h.level > 10 || h.missionTime > 0 || h.trainTime > 0
          );
          
          if (importantHeroes.length < heroes.length) {
            window.state.heroes = importantHeroes;
            console.log(`🎯 Heroes array optimized: ${heroes.length} → ${importantHeroes.length}`);
          }
        }
      }
      
      // Optimizar misiones
      if (window.state && window.state.missions) {
        const missions = window.state.missions;
        if (missions.length > 50) {
          // Mantener solo misiones activas y recientes
          const activeMissions = missions.filter(m => 
            m.heroId || m.completed || m.startTime > Date.now() - 86400000 // Últimas 24h
          );
          
          if (activeMissions.length < missions.length) {
            window.state.missions = activeMissions;
            console.log(`🎯 Missions array optimized: ${missions.length} → ${activeMissions.length}`);
          }
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Error optimizing data structures:', error);
    }
  }

  /**
   * Activa optimizaciones de rendimiento
   */
  triggerPerformanceOptimizations() {
    console.log('⚡ Triggering performance optimizations');
    
    // Limpieza agresiva de memoria
    this.memoryOptimizer.performAggressiveCleanup();
    
    // Optimizar UI
    this.uiOptimizer.autoOptimize();
    
    // Sugerir recarga si es crítico
    const memoryStats = this.memoryOptimizer.getStats();
    if (memoryStats && memoryStats.memory && memoryStats.memory.current.percentage > 95) {
      console.warn('🚨 Critical memory usage detected. Consider reloading the application.');
      
      // Mostrar notificación al usuario
      this.showMemoryWarning();
    }
  }

  /**
   * Muestra advertencia de memoria al usuario
   */
  showMemoryWarning() {
    // Crear notificación no intrusiva
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff6b6b;
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;
    
    warning.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">⚠️ High Memory Usage</div>
      <div style="margin-bottom: 12px;">The application is using a lot of memory. Consider saving and reloading.</div>
      <button onclick="this.parentElement.remove()" style="
        background: white;
        color: #ff6b6b;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">Dismiss</button>
    `;
    
    document.body.appendChild(warning);
    
    // Auto-remover después de 10 segundos
    setTimeout(() => {
      if (warning.parentElement) {
        warning.remove();
      }
    }, 10000);
  }

  /**
   * Registra métricas de rendimiento
   */
  recordPerformanceMetrics(metrics) {
    this.performanceHistory.push(metrics);
    
    // Mantener solo el historial reciente
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Obtiene estadísticas completas
   */
  getStats() {
    const memoryStats = this.memoryOptimizer.getStats();
    const uiStats = this.uiOptimizer.getMetrics();
    
    return {
      comprehensive: {
        currentLevel: this.currentLevel,
        optimizationsEnabled: this.optimizationsEnabled,
        lastOptimization: this.lastOptimization,
        optimizationCount: this.optimizationCount,
        config: COMPREHENSIVE_OPTIMIZATION_CONFIG.levels[this.currentLevel]
      },
      memory: memoryStats,
      ui: uiStats,
      performance: {
        history: this.performanceHistory.length,
        recentMetrics: this.performanceHistory.slice(-5)
      }
    };
  }

  /**
   * Habilita todas las optimizaciones
   */
  enable() {
    if (!this.optimizationsEnabled) {
      this.init();
    }
    console.log('✅ Comprehensive optimizations enabled');
  }

  /**
   * Deshabilita todas las optimizaciones
   */
  disable() {
    this.optimizationsEnabled = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.performanceCheckInterval) {
      clearInterval(this.performanceCheckInterval);
      this.performanceCheckInterval = null;
    }
    
    this.uiOptimizer.disable();
    this.memoryOptimizer.disable();
    
    console.log('❌ Comprehensive optimizations disabled');
  }

  /**
   * Limpia todos los recursos
   */
  cleanup() {
    this.disable();
    
    this.uiOptimizer.cleanup();
    this.memoryOptimizer.cleanup();
    
    this.performanceHistory.length = 0;
    this.optimizationCount = 0;
    
    console.log('🧹 Comprehensive Optimizer cleaned up');
  }

  /**
   * Configura las optimizaciones
   */
  configure(config) {
    Object.assign(COMPREHENSIVE_OPTIMIZATION_CONFIG, config);
    console.log('⚙️ Comprehensive optimization configuration updated');
  }

  /**
   * Aplica optimizaciones manualmente
   */
  optimize() {
    if (!this.optimizationsEnabled) return;
    
    console.log('🔧 Applying manual optimizations');
    
    // Limpieza de memoria
    this.memoryOptimizer.performCleanup();
    
    // Optimización de UI
    this.uiOptimizer.autoOptimize();
    
    // Optimización de estructuras de datos
    this.optimizeDataStructures();
  }

  /**
   * Aplica optimizaciones agresivas
   */
  optimizeAggressive() {
    if (!this.optimizationsEnabled) return;
    
    console.log('🚀 Applying aggressive optimizations');
    
    // Limpieza agresiva de memoria
    this.memoryOptimizer.performAggressiveCleanup();
    
    // Optimización agresiva de UI
    this.uiOptimizer.autoOptimize();
    
    // Optimización agresiva de estructuras
    this.optimizeDataStructures();
    
    // Forzar garbage collection
    if (typeof gc === 'function') {
      gc();
    }
  }
}

// Instancia global del optimizador integral
export const comprehensiveOptimizer = new ComprehensiveOptimizer();

// API simplificada para uso directo
export const ComprehensiveOptimizerAPI = {
  // Control principal
  enable: () => comprehensiveOptimizer.enable(),
  disable: () => comprehensiveOptimizer.disable(),
  getStats: () => comprehensiveOptimizer.getStats(),
  cleanup: () => comprehensiveOptimizer.cleanup(),
  
  // Optimizaciones
  optimize: () => comprehensiveOptimizer.optimize(),
  optimizeAggressive: () => comprehensiveOptimizer.optimizeAggressive(),
  
  // Configuración
  configure: (config) => comprehensiveOptimizer.configure(config),
  
  // Niveles específicos
  setLevel: (level) => comprehensiveOptimizer.applyOptimizationLevel(level),
  
  // APIs individuales
  ui: UIOptimizerAPI,
  memory: MemoryOptimizerAPI
};

// Auto-inicializar cuando sea posible
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => comprehensiveOptimizer.init(), 2000);
    });
  } else {
    setTimeout(() => comprehensiveOptimizer.init(), 2000);
  }
}

// Exponer API global para debugging
if (typeof window !== 'undefined') {
  window.ComprehensiveOptimizer = ComprehensiveOptimizerAPI;
  window.comprehensiveOptimizer = comprehensiveOptimizer;
  
  console.log('🚀 Comprehensive Optimizer API disponible en consola:');
  console.log('   • ComprehensiveOptimizer');
  console.log('   • comprehensiveOptimizer');
  console.log('   • ComprehensiveOptimizer.ui (UI optimizations)');
  console.log('   • ComprehensiveOptimizer.memory (Memory optimizations)');
}
