/**
 * Utilidades de medición de rendimiento (solo desarrollo)
 * No se incluye en producción
 */

interface PerformanceMetrics {
  inputDelay: number;
  frameTime: number;
  timestamp: number;
}

class PerformanceTracker {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;

  /**
   * Marcar el inicio de una interacción
   * @param name - Nombre de la interacción
   */
  markInput(name: string = 'input'): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    const t0 = performance.now();
    
    // Medir el tiempo hasta el siguiente frame
    requestAnimationFrame(() => {
      const dt = performance.now() - t0;
      this.recordMetric({
        inputDelay: dt,
        frameTime: 0, // Se puede expandir para medir frame time
        timestamp: Date.now()
      });
      
      // Almacenar en window para debugging
      if (typeof window !== 'undefined') {
        (window as any).__lastInput = dt;
        (window as any).__inputMetrics = this.metrics;
      }
      
      // Log discreto en desarrollo
      if (dt > 16) {
        console.warn(`⚠️ Input delay alto: ${dt.toFixed(2)}ms en "${name}"`);
      }
    });
  }

  /**
   * Medir el tiempo de ejecución de una función
   * @param name - Nombre de la operación
   * @param fn - Función a medir
   */
  measureExecution<T>(name: string, fn: () => T): T {
    if (process.env.NODE_ENV !== 'development') return fn();
    
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    if (duration > 16) {
      console.warn(`⚠️ Ejecución lenta: ${duration.toFixed(2)}ms en "${name}"`);
    }
    
    return result;
  }

  /**
   * Medir el tiempo de renderizado
   * @param name - Nombre del render
   */
  measureRender(name: string = 'render'): () => void {
    if (process.env.NODE_ENV !== 'development') return () => {};
    
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      
      if (duration > 16) {
        console.warn(`⚠️ Render lento: ${duration.toFixed(2)}ms en "${name}"`);
      }
    };
  }

  /**
   * Obtener estadísticas de rendimiento
   */
  getStats(): {
    averageInputDelay: number;
    maxInputDelay: number;
    slowInputs: number;
    totalInputs: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageInputDelay: 0,
        maxInputDelay: 0,
        slowInputs: 0,
        totalInputs: 0
      };
    }

    const delays = this.metrics.map(m => m.inputDelay);
    const average = delays.reduce((a, b) => a + b, 0) / delays.length;
    const max = Math.max(...delays);
    const slowInputs = delays.filter(d => d > 16).length;

    return {
      averageInputDelay: average,
      maxInputDelay: max,
      slowInputs,
      totalInputs: this.metrics.length
    };
  }

  /**
   * Limpiar métricas antiguas
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Limpiar todas las métricas
   */
  clear(): void {
    this.metrics = [];
  }
}

// Instancia global
export const perfTracker = new PerformanceTracker();

/**
 * Marcar el inicio de una interacción (función de conveniencia)
 * @param name - Nombre de la interacción
 */
export function markInput(name: string = 'input'): void {
  perfTracker.markInput(name);
}

/**
 * Medir ejecución de función (función de conveniencia)
 * @param name - Nombre de la operación
 * @param fn - Función a medir
 */
export function measureExecution<T>(name: string, fn: () => T): T {
  return perfTracker.measureExecution(name, fn);
}

/**
 * Medir renderizado (función de conveniencia)
 * @param name - Nombre del render
 */
export function measureRender(name: string = 'render'): () => void {
  return perfTracker.measureRender(name);
}

/**
 * Obtener estadísticas de rendimiento
 */
export function getPerformanceStats() {
  return perfTracker.getStats();
}

/**
 * Limpiar métricas de rendimiento
 */
export function clearPerformanceMetrics(): void {
  perfTracker.clear();
}
