/**
 * Inicialización del sistema de interacción fluida
 * Configura y activa todas las funcionalidades
 */

import { setupAutoMigration } from './migration';
import { getPerformanceStats } from './devPerf';

/**
 * Configuración del sistema de interacción fluida
 */
interface FluidInteractionConfig {
  autoMigration: boolean;
  performanceTracking: boolean;
  cssInjection: boolean;
  debugMode: boolean;
}

const defaultConfig: FluidInteractionConfig = {
  autoMigration: true,
  performanceTracking: process.env.NODE_ENV === 'development',
  cssInjection: true,
  debugMode: process.env.NODE_ENV === 'development'
};

/**
 * Clase principal del sistema de interacción fluida
 */
class FluidInteractionSystem {
  private config: FluidInteractionConfig;
  private isInitialized = false;

  constructor(config: Partial<FluidInteractionConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Inicializar el sistema
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      console.warn('⚠️ Sistema de interacción fluida ya inicializado');
      return;
    }

    console.log('🚀 Inicializando sistema de interacción fluida...');

    try {
      // 1. Inyectar estilos CSS
      if (this.config.cssInjection) {
        await this.injectStyles();
      }

      // 2. Configurar migración automática
      if (this.config.autoMigration) {
        setupAutoMigration();
      }

      // 3. Configurar debugging si está habilitado
      if (this.config.debugMode) {
        this.setupDebugMode();
      }

      this.isInitialized = true;
      console.log('✅ Sistema de interacción fluida inicializado correctamente');

    } catch (error) {
      console.error('❌ Error inicializando sistema de interacción fluida:', error);
      throw error;
    }
  }

  /**
   * Inyectar estilos CSS
   */
  private async injectStyles(): Promise<void> {
    try {
      // Verificar si los estilos ya están inyectados
      if (document.querySelector('#fluid-interaction-styles')) {
        return;
      }

      // Crear elemento de estilo
      const styleElement = document.createElement('style');
      styleElement.id = 'fluid-interaction-styles';
      styleElement.textContent = this.getDefaultStyles();

      // Inyectar en el head
      document.head.appendChild(styleElement);
      console.log('🎨 Estilos de interacción fluida inyectados');

    } catch (error) {
      console.warn('⚠️ No se pudieron inyectar estilos CSS:', error);
    }
  }

  /**
   * Obtener estilos CSS por defecto (fallback)
   */
  private getDefaultStyles(): string {
    return `
      .interactive-element {
        transition: transform 120ms ease-out, filter 120ms ease-out;
        will-change: transform;
        cursor: pointer;
        user-select: none;
      }
      
      .interactive-element.pressed {
        transform: scale(0.98);
        filter: brightness(0.96);
      }
      
      .interactive-element:hover {
        transform: scale(1.02);
        filter: brightness(1.05);
      }
      
      @media (prefers-reduced-motion: reduce) {
        .interactive-element {
          transition: none;
        }
        .interactive-element.pressed,
        .interactive-element:hover {
          transform: none;
          filter: none;
        }
      }
    `;
  }

  /**
   * Configurar modo debug
   */
  private setupDebugMode(): void {
    if (typeof window === 'undefined') return;

    // Exponer funciones de debug en window
    (window as any).__fluidInteraction = {
      getStats: getPerformanceStats,
      getConfig: () => this.config,
      isInitialized: () => this.isInitialized
    };

    // Log de información del sistema
    console.log('🔧 Sistema de interacción fluida en modo debug');
    console.log('📊 Estadísticas disponibles en: window.__fluidInteraction.getStats()');
    console.log('⚙️ Configuración disponible en: window.__fluidInteraction.getConfig()');
  }

  /**
   * Obtener estadísticas de rendimiento
   */
  getPerformanceStats() {
    if (!this.config.performanceTracking) {
      return { error: 'Performance tracking disabled' };
    }
    return getPerformanceStats();
  }

  /**
   * Verificar si el sistema está inicializado
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtener configuración actual
   */
  getConfig(): FluidInteractionConfig {
    return { ...this.config };
  }

  /**
   * Limpiar y desactivar el sistema
   */
  destroy(): void {
    if (!this.isInitialized) return;

    console.log('🧹 Limpiando sistema de interacción fluida...');

    // Remover estilos inyectados
    const styleElement = document.querySelector('#fluid-interaction-styles');
    if (styleElement) {
      styleElement.remove();
    }

    // Limpiar elementos migrados
    const migratedElements = document.querySelectorAll('[data-fluid-migrated]');
    migratedElements.forEach(el => {
      el.removeAttribute('data-fluid-migrated');
      el.classList.remove('interactive-element', 'pressed');
    });

    // Limpiar debugging
    if (typeof window !== 'undefined' && (window as any).__fluidInteraction) {
      delete (window as any).__fluidInteraction;
    }

    this.isInitialized = false;
    console.log('✅ Sistema de interacción fluida limpiado');
  }
}

// Instancia global
export const fluidInteraction = new FluidInteractionSystem();

/**
 * Función de conveniencia para inicialización rápida
 */
export function initFluidInteraction(config?: Partial<FluidInteractionConfig>): Promise<void> {
  if (config) {
    Object.assign(fluidInteraction.config, config);
  }
  return fluidInteraction.init();
}

/**
 * Función de conveniencia para obtener estadísticas
 */
export function getFluidInteractionStats() {
  return fluidInteraction.getPerformanceStats();
}

/**
 * Función de conveniencia para verificar estado
 */
export function isFluidInteractionReady(): boolean {
  return fluidInteraction.isReady();
}

// Auto-inicialización cuando se importa el módulo
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    fluidInteraction.init().catch(console.error);
  });
} else if (typeof document !== 'undefined') {
  // DOM ya está listo
  fluidInteraction.init().catch(console.error);
}
