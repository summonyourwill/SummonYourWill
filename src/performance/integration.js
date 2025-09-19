// Integración fácil de optimizaciones de rendimiento
// Este archivo permite activar optimizaciones de forma gradual y reversible

import {
  smartRenderMissions,
  smartRenderDailyMissions,
  smartScheduleRender,
  smartScheduleDailyRender,
  enableOptimizations,
  disableOptimizations,
  areOptimizationsEnabled,
  getPerformanceMetrics,
  testOptimizations,
  initOptimizations
} from './migrationHelper.js';

/**
 * API simplificada para integrar optimizaciones
 */
export const PerformanceManager = {
  // Estado actual
  get enabled() {
    return areOptimizationsEnabled();
  },
  
  // Habilitar optimizaciones
  enable() {
    enableOptimizations();
    console.log('✅ Optimizaciones habilitadas');
  },
  
  // Deshabilitar optimizaciones
  disable() {
    disableOptimizations();
    console.log('❌ Optimizaciones deshabilitadas');
  },
  
  // Alternar optimizaciones
  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  },
  
  // Obtener métricas
  getMetrics() {
    return getPerformanceMetrics();
  },
  
  // Mostrar métricas en consola
  showMetrics() {
    const metrics = this.getMetrics();
    console.log('📊 Métricas de Rendimiento:');
    console.log(`  Optimizaciones: ${metrics.optimizationsEnabled ? '✅ Activas' : '❌ Inactivas'}`);
    console.log(`  Tiempo promedio de renderizado: ${metrics.averageRenderTime}ms`);
    console.log(`  Frames perdidos: ${metrics.frameDrops}`);
    console.log(`  Uso de memoria: ${metrics.memoryUsage}MB`);
    console.log(`  Recomendación: ${metrics.recommendation}`);
  },
  
  // Probar optimizaciones
  test() {
    return testOptimizations();
  },
  
  // Inicializar sistema
  init() {
    initOptimizations();
  }
};

/**
 * Funciones de renderizado optimizadas para reemplazar las originales
 */
export const OptimizedRenderers = {
  renderMissions: smartRenderMissions,
  renderDailyMissions: smartRenderDailyMissions,
  scheduleRender: smartScheduleRender,
  scheduleDailyRender: smartScheduleDailyRender
};

/**
 * Hook para reemplazar fácilmente las funciones originales
 * INSTRUCCIONES DE USO:
 * 
 * 1. En el archivo donde se usan las funciones originales, importar:
 *    import { replaceWithOptimized } from './performance/integration.js';
 * 
 * 2. Llamar al reemplazo:
 *    replaceWithOptimized();
 * 
 * 3. Las funciones originales serán reemplazadas automáticamente
 */
export function replaceWithOptimized() {
  // Buscar y reemplazar renderMissions global
  if (typeof window !== 'undefined' && window.renderMissions) {
    window.renderMissions = smartRenderMissions;
    console.log('🔄 renderMissions reemplazada con versión optimizada');
  }
  
  // Buscar y reemplazar renderDailyMissions global
  if (typeof window !== 'undefined' && window.renderDailyMissions) {
    window.renderDailyMissions = smartRenderDailyMissions;
    console.log('🔄 renderDailyMissions reemplazada con versión optimizada');
  }
}

/**
 * Restaurar funciones originales
 */
export function restoreOriginalFunctions() {
  // Esta función requeriría referencias a las funciones originales
  // Por ahora, recarga la página para restaurar
  console.log('🔄 Para restaurar funciones originales, recarga la página');
}

/**
 * Panel de control en consola para testing
 */
export function showControlPanel() {
  console.log(`
🎮 PANEL DE CONTROL DE OPTIMIZACIONES
=====================================

Comandos disponibles:
• PerformanceManager.enable()     - Habilitar optimizaciones
• PerformanceManager.disable()    - Deshabilitar optimizaciones  
• PerformanceManager.toggle()     - Alternar optimizaciones
• PerformanceManager.showMetrics() - Ver métricas de rendimiento
• PerformanceManager.test()       - Probar diferencia de rendimiento

Estado actual: ${areOptimizationsEnabled() ? '✅ ACTIVO' : '❌ INACTIVO'}

Ejemplo de uso:
PerformanceManager.enable();
PerformanceManager.showMetrics();
  `);
}

/**
 * Auto-exposición de API en consola para debugging
 */
if (typeof window !== 'undefined') {
  window.PerformanceManager = PerformanceManager;
  window.showOptimizationPanel = showControlPanel;
  
  console.log('🛠️ Panel de optimizaciones disponible en consola:');
  console.log('   • PerformanceManager');
  console.log('   • showOptimizationPanel()');
}

/**
 * Configuración específica para Electron
 */
export function configureForElectron() {
  // Configuraciones específicas para aplicaciones Electron
  const electronConfig = {
    autoDetectPerformance: true,
    performanceThreshold: {
      renderTime: 30, // Más estricto en Electron
      memoryUsage: 150 * 1024 * 1024, // 150MB
      frameDrops: 3
    }
  };
  
  console.log('⚡ Configuración optimizada para Electron aplicada');
  return electronConfig;
}

// Inicializar automáticamente en Electron
if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
  configureForElectron();
}
