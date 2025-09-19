// Helper para migración gradual a optimizaciones
// Permite usar optimizaciones de forma opcional sin romper la funcionalidad actual

import { renderMissionsOptimized, scheduleOptimizedRender, cleanupMissionOptimizations } from '../missions/optimized.js';
import { renderDailyMissionsOptimized, scheduleOptimizedDailyRender } from '../dailyMissions/optimized.js';
import { renderMissions } from '../missions.js';
import { renderDailyMissions } from '../dailyMissions.js';

// Flag para habilitar/deshabilitar optimizaciones
let optimizationsEnabled = false;

// Configuración de optimizaciones
const OPTIMIZATION_CONFIG = {
  // Habilitar optimizaciones automáticamente en dispositivos menos potentes
  autoDetectPerformance: true,
  
  // Umbral de rendimiento para activar optimizaciones automáticamente
  performanceThreshold: {
    renderTime: 50, // ms
    memoryUsage: 100 * 1024 * 1024, // 100MB
    frameDrops: 5 // frames perdidos consecutivos
  },
  
  // Métricas de rendimiento
  metrics: {
    renderTimes: [],
    frameDrops: 0,
    lastFrameTime: 0
  }
};

/**
 * Detecta automáticamente si se necesitan optimizaciones
 */
function detectPerformanceNeeds() {
  if (!OPTIMIZATION_CONFIG.autoDetectPerformance) return false;
  
  const metrics = OPTIMIZATION_CONFIG.metrics;
  
  // Verificar tiempo promedio de renderizado
  if (metrics.renderTimes.length > 0) {
    const avgRenderTime = metrics.renderTimes.reduce((a, b) => a + b, 0) / metrics.renderTimes.length;
    if (avgRenderTime > OPTIMIZATION_CONFIG.performanceThreshold.renderTime) {
      console.log('🚀 Performance optimization enabled: Slow render times detected');
      return true;
    }
  }
  
  // Verificar uso de memoria
  if (performance.memory && performance.memory.usedJSHeapSize > OPTIMIZATION_CONFIG.performanceThreshold.memoryUsage) {
    console.log('🚀 Performance optimization enabled: High memory usage detected');
    return true;
  }
  
  // Verificar frames perdidos
  if (metrics.frameDrops > OPTIMIZATION_CONFIG.performanceThreshold.frameDrops) {
    console.log('🚀 Performance optimization enabled: Frame drops detected');
    return true;
  }
  
  return false;
}

/**
 * Mide el rendimiento de una operación
 */
function measurePerformance(operationName, operation) {
  const startTime = performance.now();
  const result = operation();
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  // Guardar métricas
  OPTIMIZATION_CONFIG.metrics.renderTimes.push(renderTime);
  if (OPTIMIZATION_CONFIG.metrics.renderTimes.length > 10) {
    OPTIMIZATION_CONFIG.metrics.renderTimes.shift(); // Mantener solo los últimos 10
  }
  
  // Detectar frame drops
  if (renderTime > 16) { // 60fps = 16ms por frame
    OPTIMIZATION_CONFIG.metrics.frameDrops++;
  } else {
    OPTIMIZATION_CONFIG.metrics.frameDrops = 0; // Reset si no hay drops
  }
  
  // Auto-activar optimizaciones si es necesario
  if (!optimizationsEnabled && detectPerformanceNeeds()) {
    enableOptimizations();
  }
  
  return result;
}

/**
 * Wrapper optimizado para renderMissions
 */
export function smartRenderMissions() {
  return measurePerformance('renderMissions', () => {
    if (optimizationsEnabled) {
      return renderMissionsOptimized();
    } else {
      return renderMissions();
    }
  });
}

/**
 * Wrapper optimizado para renderDailyMissions
 */
export function smartRenderDailyMissions() {
  return measurePerformance('renderDailyMissions', () => {
    if (optimizationsEnabled) {
      return renderDailyMissionsOptimized();
    } else {
      return renderDailyMissions();
    }
  });
}

/**
 * Wrapper optimizado para renderizado programado
 */
export function smartScheduleRender() {
  if (optimizationsEnabled) {
    scheduleOptimizedRender();
  } else {
    // Usar setTimeout simple como fallback
    setTimeout(renderMissions, 16);
  }
}

/**
 * Wrapper optimizado para renderizado diario programado
 */
export function smartScheduleDailyRender() {
  if (optimizationsEnabled) {
    scheduleOptimizedDailyRender();
  } else {
    // Usar setTimeout simple como fallback
    setTimeout(renderDailyMissions, 16);
  }
}

/**
 * Habilita las optimizaciones
 */
export function enableOptimizations() {
  if (optimizationsEnabled) return;
  
  optimizationsEnabled = true;
  console.log('🚀 Mission optimizations enabled');
  
  // Notificar al usuario si es manual
  if (window.showNotification) {
    window.showNotification('Optimizaciones de rendimiento activadas', 'success');
  }
}

/**
 * Deshabilita las optimizaciones
 */
export function disableOptimizations() {
  if (!optimizationsEnabled) return;
  
  optimizationsEnabled = false;
  cleanupMissionOptimizations();
  console.log('📴 Mission optimizations disabled');
  
  if (window.showNotification) {
    window.showNotification('Optimizaciones de rendimiento desactivadas', 'info');
  }
}

/**
 * Verifica si las optimizaciones están habilitadas
 */
export function areOptimizationsEnabled() {
  return optimizationsEnabled;
}

/**
 * Obtiene métricas de rendimiento actual
 */
export function getPerformanceMetrics() {
  const metrics = OPTIMIZATION_CONFIG.metrics;
  const avgRenderTime = metrics.renderTimes.length > 0 
    ? metrics.renderTimes.reduce((a, b) => a + b, 0) / metrics.renderTimes.length 
    : 0;
  
  return {
    optimizationsEnabled,
    averageRenderTime: Math.round(avgRenderTime * 100) / 100,
    frameDrops: metrics.frameDrops,
    memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'N/A',
    recommendation: detectPerformanceNeeds() ? 'Enable optimizations' : 'Current performance is good'
  };
}

/**
 * Configura las optimizaciones
 */
export function configureOptimizations(config) {
  Object.assign(OPTIMIZATION_CONFIG, config);
}

/**
 * Función para testing manual de optimizaciones
 */
export function testOptimizations() {
  console.log('🧪 Testing mission optimizations...');
  
  const originalEnabled = optimizationsEnabled;
  
  // Test sin optimizaciones
  disableOptimizations();
  const startTime1 = performance.now();
  renderMissions();
  const time1 = performance.now() - startTime1;
  
  // Test con optimizaciones
  enableOptimizations();
  const startTime2 = performance.now();
  renderMissionsOptimized();
  const time2 = performance.now() - startTime2;
  
  // Restaurar estado original
  if (!originalEnabled) {
    disableOptimizations();
  }
  
  const improvement = time1 > 0 ? ((time1 - time2) / time1 * 100) : 0;
  
  console.log('📊 Test Results:');
  console.log(`  Original: ${time1.toFixed(2)}ms`);
  console.log(`  Optimized: ${time2.toFixed(2)}ms`);
  console.log(`  Improvement: ${improvement.toFixed(1)}%`);
  
  return {
    originalTime: time1,
    optimizedTime: time2,
    improvement: improvement
  };
}

/**
 * Inicializa el sistema de optimizaciones
 */
export function initOptimizations() {
  console.log('🎯 Mission optimization system initialized');
  
  // Detectar capacidades del dispositivo
  const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                        (performance.memory && performance.memory.jsHeapSizeLimit < 1073741824); // < 1GB
  
  if (isLowEndDevice) {
    console.log('📱 Low-end device detected, enabling optimizations');
    enableOptimizations();
  }
  
  // Configurar auto-detección
  OPTIMIZATION_CONFIG.autoDetectPerformance = true;
}

// Auto-inicializar cuando se carga el módulo
if (typeof window !== 'undefined') {
  // Esperar a que se cargue el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizations);
  } else {
    initOptimizations();
  }
}
