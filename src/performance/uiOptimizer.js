// Integrador principal de optimizaciones de UI
// Combina optimizaciones para selectores de héroes y modales

import { 
  createOptimizedHeroSelector,
  updateOptimizedHeroSelector,
  MissionHeroSelector,
  GiantBossHeroSelector,
  clearHeroSelectorCache,
  cleanupHeroSelectorPool
} from './heroSelectorOptimizer.js';

import {
  createOptimizedConfirmModal,
  createCloseConfirmationModal,
  createResetConfirmationModal,
  createActionConfirmationModal,
  replaceOpenConfirm,
  optimizeExistingModals,
  cleanupModalPool,
  configureModalAnimations
} from './modalOptimizer.js';

import { performanceMonitor } from './missionOptimizer.js';

// Configuración global de optimizaciones
const UI_OPTIMIZATION_CONFIG = {
  // Selectores de héroes
  heroSelectors: {
    enabled: true,
    cacheEnabled: true,
    poolEnabled: true,
    animationDuration: 100
  },
  
  // Modales
  modals: {
    enabled: true,
    animationsEnabled: true,
    animationDuration: 150,
    keyboardShortcuts: true
  },
  
  // Auto-optimización
  autoOptimize: true,
  performanceThreshold: 30 // ms
};

/**
 * Clase principal para gestionar todas las optimizaciones de UI
 */
export class UIOptimizer {
  constructor() {
    this.optimizationsEnabled = false;
    this.performanceMetrics = new Map();
    this.heroSelectors = new Map();
    this.modals = new Map();
  }

  /**
   * Inicializa todas las optimizaciones de UI
   */
  init() {
    performanceMonitor.start('uiOptimizerInit');
    
    try {
      // Configurar animaciones de modales
      configureModalAnimations({
        duration: UI_OPTIMIZATION_CONFIG.modals.animationDuration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      });

      // Reemplazar funciones existentes
      if (UI_OPTIMIZATION_CONFIG.modals.enabled) {
        replaceOpenConfirm();
        optimizeExistingModals();
      }

      // Configurar optimizaciones automáticas
      if (UI_OPTIMIZATION_CONFIG.autoOptimize) {
        this.setupAutoOptimization();
      }

      this.optimizationsEnabled = true;
      console.log('🚀 UI Optimizations initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing UI optimizations:', error);
      this.optimizationsEnabled = false;
    }
    
    performanceMonitor.end('uiOptimizerInit');
  }

  /**
   * Configura optimizaciones automáticas basadas en rendimiento
   */
  setupAutoOptimization() {
    // Monitorear rendimiento de selectores
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('createHeroSelector') || 
            entry.name.includes('createConfirmModal')) {
          
          const duration = entry.duration;
          if (duration > UI_OPTIMIZATION_CONFIG.performanceThreshold) {
            console.log(`⚠️ Slow UI operation detected: ${entry.name} took ${duration.toFixed(2)}ms`);
            this.autoOptimize();
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['measure'] });
    } catch (e) {
      // PerformanceObserver no disponible en algunos navegadores
      console.log('📱 PerformanceObserver not available, using fallback monitoring');
      this.setupFallbackMonitoring();
    }
  }

  /**
   * Monitoreo alternativo para navegadores sin PerformanceObserver
   */
  setupFallbackMonitoring() {
    setInterval(() => {
      // Verificar uso de memoria
      if (performance.memory && performance.memory.usedJSHeapSize > 100 * 1024 * 1024) {
        console.log('⚠️ High memory usage detected, triggering optimizations');
        this.autoOptimize();
      }
    }, 10000); // Cada 10 segundos
  }

  /**
   * Aplicar optimizaciones automáticamente
   */
  autoOptimize() {
    if (!this.optimizationsEnabled) return;
    
    // Limpiar caches si es necesario
    if (UI_OPTIMIZATION_CONFIG.heroSelectors.cacheEnabled) {
      clearHeroSelectorCache();
    }
    
    // Forzar re-renderizado optimizado
    this.refreshOptimizedElements();
  }

  /**
   * Refrescar elementos optimizados
   */
  refreshOptimizedElements() {
    // Refrescar selectores de héroes
    this.heroSelectors.forEach((selector, id) => {
      if (selector.refresh) {
        selector.refresh();
      }
    });
  }

  /**
   * Crear selector de héroes optimizado para misiones
   */
  createMissionHeroSelector(container, slot, requiredEnergy) {
    if (!this.optimizationsEnabled) {
      return this.createFallbackSelector(container, slot, requiredEnergy);
    }

    const selector = new MissionHeroSelector(container, slot, requiredEnergy);
    const selectElement = selector.create();
    
    this.heroSelectors.set(`mission_${slot.id}`, selector);
    
    return selectElement;
  }

  /**
   * Crear selector de héroes optimizado para GiantBoss
   */
  createGiantBossHeroSelector(container, role, index) {
    if (!this.optimizationsEnabled) {
      return this.createFallbackBossSelector(container, role, index);
    }

    const selector = new GiantBossHeroSelector(container, role, index);
    const result = selector.create();
    
    this.heroSelectors.set(`boss_${index}`, selector);
    
    return result;
  }

  /**
   * Crear modal de confirmación optimizado
   */
  createConfirmModal(config) {
    if (!this.optimizationsEnabled) {
      return this.createFallbackModal(config);
    }

    const modal = createOptimizedConfirmModal({
      ...config,
      animation: UI_OPTIMIZATION_CONFIG.modals.animationsEnabled
    });
    
    this.modals.set(`modal_${Date.now()}`, modal);
    
    return modal;
  }

  /**
   * Crear modal de confirmación de cierre optimizado
   */
  createCloseModal(config) {
    if (!this.optimizationsEnabled) {
      return this.createFallbackCloseModal(config);
    }

    const modal = createCloseConfirmationModal({
      ...config,
      animation: UI_OPTIMIZATION_CONFIG.modals.animationsEnabled
    });
    
    this.modals.set(`close_modal_${Date.now()}`, modal);
    
    return modal;
  }

  /**
   * Fallback para selectores de misiones
   */
  createFallbackSelector(container, slot, requiredEnergy) {
    const select = document.createElement('select');
    select.style.width = '100%';
    
    const opt = document.createElement('option');
    opt.textContent = 'Choose Hero';
    opt.value = '';
    select.appendChild(opt);
    
    // Lógica básica de fallback
    if (window.state?.heroes) {
      window.state.heroes.forEach(h => {
        if (h.energia >= requiredEnergy) {
          const option = document.createElement('option');
          option.value = h.id;
          option.textContent = h.name;
          select.appendChild(option);
        }
      });
    }
    
    return select;
  }

  /**
   * Fallback para selectores de GiantBoss
   */
  createFallbackBossSelector(container, role, index) {
    const box = document.createElement('div');
    box.className = 'mission-slot boss-slot';
    
    const avatar = document.createElement('img');
    avatar.src = window.EMPTY_SRC || '';
    avatar.className = 'mission-avatar empty';
    box.appendChild(avatar);
    
    const select = document.createElement('select');
    select.className = 'boss-hero-select';
    box.appendChild(select);
    
    container.appendChild(box);
    
    return { select, avatar, box };
  }

  /**
   * Fallback para modales
   */
  createFallbackModal(config) {
    // Usar la función original si está disponible
    if (typeof window.openConfirm === 'function') {
      return window.openConfirm(config);
    }
    
    // Crear modal básico
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay card-modal';
    overlay.style.background = 'rgba(0, 0, 0, 0.5)';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <h3>${config.title || 'Confirm'}</h3>
      <p>${config.message || ''}</p>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button class="btn btn-green" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-red" onclick="this.closest('.modal-overlay').remove()">Confirm</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    return { overlay, modal, close: () => overlay.remove() };
  }

  /**
   * Fallback para modales de cierre
   */
  createFallbackCloseModal(config) {
    return this.createFallbackModal({
      title: 'Exit Confirmation',
      message: config.message || 'Do you want to export your save before exiting?',
      ...config
    });
  }

  /**
   * Habilitar optimizaciones
   */
  enable() {
    this.optimizationsEnabled = true;
    console.log('✅ UI Optimizations enabled');
  }

  /**
   * Deshabilitar optimizaciones
   */
  disable() {
    this.optimizationsEnabled = false;
    console.log('❌ UI Optimizations disabled');
  }

  /**
   * Obtener métricas de rendimiento
   */
  getMetrics() {
    return {
      optimizationsEnabled: this.optimizationsEnabled,
      heroSelectorsCount: this.heroSelectors.size,
      modalsCount: this.modals.size,
      config: UI_OPTIMIZATION_CONFIG
    };
  }

  /**
   * Limpiar recursos
   */
  cleanup() {
    // Limpiar selectores
    this.heroSelectors.forEach(selector => {
      if (selector.destroy) {
        selector.destroy();
      }
    });
    this.heroSelectors.clear();
    
    // Limpiar modales
    this.modals.forEach(modal => {
      if (modal.close) {
        modal.close();
      }
    });
    this.modals.clear();
    
    // Limpiar pools
    cleanupHeroSelectorPool();
    cleanupModalPool();
    
    console.log('🧹 UI Optimizations cleaned up');
  }

  /**
   * Configurar optimizaciones
   */
  configure(config) {
    Object.assign(UI_OPTIMIZATION_CONFIG, config);
    console.log('⚙️ UI Optimization configuration updated');
  }
}

// Instancia global del optimizador
export const uiOptimizer = new UIOptimizer();

// API simplificada para uso directo
export const UIOptimizerAPI = {
  // Selectores de héroes
  createMissionSelector: (container, slot, energy) => 
    uiOptimizer.createMissionHeroSelector(container, slot, energy),
  
  createBossSelector: (container, role, index) => 
    uiOptimizer.createGiantBossHeroSelector(container, role, index),
  
  // Modales
  createConfirm: (config) => uiOptimizer.createConfirmModal(config),
  createCloseConfirm: (config) => uiOptimizer.createCloseModal(config),
  
  // Control
  enable: () => uiOptimizer.enable(),
  disable: () => uiOptimizer.disable(),
  getMetrics: () => uiOptimizer.getMetrics(),
  cleanup: () => uiOptimizer.cleanup(),
  configure: (config) => uiOptimizer.configure(config)
};

// Auto-inicializar cuando sea posible
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => uiOptimizer.init(), 200);
    });
  } else {
    setTimeout(() => uiOptimizer.init(), 200);
  }
}

// Exponer API global para debugging
if (typeof window !== 'undefined') {
  window.UIOptimizer = UIOptimizerAPI;
  window.uiOptimizer = uiOptimizer;
  
  console.log('🛠️ UI Optimizer API disponible en consola:');
  console.log('   • UIOptimizer');
  console.log('   • uiOptimizer');
}
