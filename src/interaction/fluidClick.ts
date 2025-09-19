/**
 * Sistema de interacción fluida para mejorar la experiencia del usuario
 * Proporciona feedback visual inmediato y difiere trabajo pesado
 */

/**
 * Vincula un elemento con interacción fluida
 * @param el - Elemento HTML a vincular
 * @param action - Función de acción principal
 * @param options - Opciones de configuración
 */
export function bindFluidClick(
  el: HTMLElement, 
  action: (ev: Event) => void,
  options: {
    immediateFeedback?: boolean;
    deferAction?: boolean;
    preventDefault?: boolean;
  } = {}
) {
  const {
    immediateFeedback = true,
    deferAction = true,
    preventDefault = false
  } = options;

  // Feedback inmediato en pointerdown (no bloquea pintura)
  if (immediateFeedback) {
    el.addEventListener('pointerdown', (ev) => {
      if (preventDefault) ev.preventDefault();
      requestAnimationFrame(() => {
        el.classList.add('pressed');
        // Asegurar que el estado visual se aplique
        el.style.transform = 'scale(0.98)';
        el.style.filter = 'brightness(0.96)';
      });
    }, { passive: !preventDefault });
  }

  // Acción principal: diferida para no bloquear el frame
  el.addEventListener('click', (ev) => {
    if (preventDefault) ev.preventDefault();
    
    if (deferAction) {
      // Pequeño diferido para permitir que se complete el frame actual
      setTimeout(() => action(ev), 0);
    } else {
      // Acción inmediata si se especifica
      action(ev);
    }
  });

  // Limpieza del estado visual
  const clearPressedState = () => {
    el.classList.remove('pressed');
    el.style.transform = '';
    el.style.filter = '';
  };

  el.addEventListener('pointerup', clearPressedState);
  el.addEventListener('pointercancel', clearPressedState);
  el.addEventListener('blur', clearPressedState);
  el.addEventListener('pointerleave', clearPressedState);

  // Retornar función de limpieza
  return () => {
    el.removeEventListener('pointerdown', () => {});
    el.removeEventListener('click', () => {});
    el.removeEventListener('pointerup', clearPressedState);
    el.removeEventListener('pointercancel', clearPressedState);
    el.removeEventListener('blur', clearPressedState);
    el.removeEventListener('pointerleave', clearPressedState);
    clearPressedState();
  };
}

/**
 * Diferir trabajo pesado para no bloquear el hilo principal
 * @param fn - Función a ejecutar
 * @param timeout - Timeout máximo en ms
 */
export function deferHeavyWork(fn: () => void, timeout: number = 300) {
  // Usar requestIdleCallback si está disponible, fallback a setTimeout
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(fn, { timeout });
  } else {
    // Fallback: ejecutar en el siguiente tick del event loop
    setTimeout(fn, 0);
  }
}

/**
 * Ejecutar en el siguiente frame de animación
 * @param fn - Función a ejecutar
 */
export function deferToNextFrame(fn: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
}

/**
 * Delegación de eventos para listas/tablas
 * @param container - Contenedor padre
 * @param selector - Selector para elementos interactivos
 * @param action - Función de acción
 */
export function bindDelegatedClick(
  container: HTMLElement,
  selector: string,
  action: (el: HTMLElement, ev: Event) => void
) {
  container.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;
    const interactiveEl = target.closest(selector);
    
    if (!interactiveEl) return;
    
    // Feedback visual inmediato
    interactiveEl.classList.add('pressed');
    interactiveEl.style.transform = 'scale(0.98)';
    interactiveEl.style.filter = 'brightness(0.96)';
    
    // Limpiar estado visual
    setTimeout(() => {
      interactiveEl.classList.remove('pressed');
      interactiveEl.style.transform = '';
      interactiveEl.style.filter = '';
    }, 150);
    
    // Ejecutar acción
    action(interactiveEl, ev);
  });
}

/**
 * Optimizar mediciones y mutaciones para evitar reflows
 * @param measureFn - Función de medición (reads)
 * @param mutateFn - Función de mutación (writes)
 */
export function optimizeLayout(measureFn: () => void, mutateFn: () => void) {
  // 1. Medir en el frame actual
  requestAnimationFrame(() => {
    measureFn();
    // 2. Mutar en el siguiente frame
    requestAnimationFrame(mutateFn);
  });
}

/**
 * Crear un botón con interacción fluida
 * @param text - Texto del botón
 * @param action - Acción del botón
 * @param className - Clases CSS adicionales
 */
export function createFluidButton(
  text: string,
  action: (ev: Event) => void,
  className: string = ''
): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = `fluid-button ${className}`.trim();
  
  bindFluidClick(button, action);
  
  return button;
}

/**
 * Aplicar interacción fluida a múltiples elementos
 * @param selector - Selector CSS
 * @param action - Función de acción
 */
export function bindFluidClickToSelector(selector: string, action: (ev: Event) => void) {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  const cleanupFunctions: (() => void)[] = [];
  
  elements.forEach(el => {
    const cleanup = bindFluidClick(el, action);
    cleanupFunctions.push(cleanup);
  });
  
  // Retornar función de limpieza para todos
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}
