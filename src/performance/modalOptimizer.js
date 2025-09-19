// @ts-nocheck
// Optimizador para modales y pop-ups
// Mejora la fluidez de aparición y cierre de confirmaciones

import { performanceMonitor } from './missionOptimizer.js';

// Configuración de animaciones
const MODAL_ANIMATION_CONFIG = {
  duration: 150, // ms
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  fadeIn: true,
  slideIn: true,
  scaleIn: true
};

// Pool de elementos DOM para modales
class ModalElementPool {
  constructor() {
    this.overlays = [];
    this.modals = [];
    this.buttons = [];
    this.maxSize = 10;
  }

  getOverlay() {
    if (this.overlays.length > 0) {
      return this.overlays.pop();
    }
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay card-modal';
    return overlay;
  }

  getModal() {
    if (this.modals.length > 0) {
      return this.modals.pop();
    }
    const modal = document.createElement('div');
    modal.className = 'modal';
    return modal;
  }

  getButton() {
    if (this.buttons.length > 0) {
      return this.buttons.pop();
    }
    const button = document.createElement('button');
    button.type = 'button';
    return button;
  }

  releaseOverlay(overlay) {
    if (this.overlays.length < this.maxSize) {
      overlay.innerHTML = '';
      overlay.className = 'modal-overlay card-modal';
      overlay.removeAttribute('style');
      this.overlays.push(overlay);
    }
  }

  releaseModal(modal) {
    if (this.modals.length < this.maxSize) {
      modal.innerHTML = '';
      modal.className = 'modal';
      modal.removeAttribute('style');
      this.modals.push(modal);
    }
  }

  releaseButton(button) {
    if (this.buttons.length < this.maxSize) {
      button.textContent = '';
      button.className = '';
      button.onclick = null;
      button.removeAttribute('style');
      this.buttons.push(button);
    }
  }
}

export const modalPool = new ModalElementPool();

/**
 * Crea un modal de confirmación optimizado
 * @param {Object} config - Configuración del modal
 * @returns {Object} Modal optimizado con métodos de control
 */
export function createOptimizedConfirmModal({
  title = 'Confirm',
  message = '',
  onConfirm = null,
  onCancel = null,
  onReturn = null,
  container = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  returnText = 'Return',
  confirmClass = 'btn btn-red',
  cancelClass = 'btn btn-lightyellow',
  returnClass = 'btn btn-green',
  showReturn = false,
  animation = true
}) {
  performanceMonitor.start('createConfirmModal');
  
  // Usar elementos del pool
  const overlay = modalPool.getOverlay();
  const modal = modalPool.getModal();
  
  // Configurar overlay
  overlay.style.background = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '1000';
  
  // Configurar modal
  modal.style.padding = '20px';
  modal.style.maxWidth = '400px';
  modal.style.width = '100%';
  
  // Título
  const titleEl = document.createElement('h3');
  titleEl.style.margin = '0 0 8px';
  titleEl.style.fontSize = '18px';
  titleEl.style.fontWeight = 'bold';
  titleEl.textContent = title;
  modal.appendChild(titleEl);
  
  // Mensaje
  const msgEl = document.createElement('p');
  msgEl.style.margin = '0 0 16px';
  msgEl.style.lineHeight = '1.4';
  msgEl.textContent = message;
  modal.appendChild(msgEl);
  
  // Botones
  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '8px';
  btnRow.style.justifyContent = 'flex-end';
  btnRow.style.flexWrap = 'wrap';
  
  // Botón Return (si se especifica)
  let returnBtn = null;
  if (showReturn && onReturn) {
    returnBtn = modalPool.getButton();
    returnBtn.className = returnClass;
    returnBtn.textContent = returnText;
    returnBtn.onclick = () => {
      onReturn();
      closeModal();
    };
    btnRow.appendChild(returnBtn);
  }
  
  // Botón Cancel
  const cancelBtn = modalPool.getButton();
  cancelBtn.className = cancelClass;
  cancelBtn.textContent = cancelText;
  cancelBtn.onclick = () => {
    if (onCancel) onCancel();
    closeModal();
  };
  btnRow.appendChild(cancelBtn);
  
  // Botón Confirm
  const confirmBtn = modalPool.getButton();
  confirmBtn.className = confirmClass;
  confirmBtn.textContent = confirmText;
  confirmBtn.onclick = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };
  btnRow.appendChild(confirmBtn);
  
  modal.appendChild(btnRow);
  overlay.appendChild(modal);
  
  // Agregar al contenedor
  if (container) {
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    container.appendChild(overlay);
  } else {
    document.body.appendChild(overlay);
  }
  
  // Función de cierre optimizada
  function closeModal() {
    if (animation) {
      animateModalOut(overlay, () => {
        removeModal();
      });
    } else {
      removeModal();
    }
  }
  
  function removeModal() {
    // Devolver elementos al pool
    modalPool.releaseOverlay(overlay);
    modalPool.releaseModal(modal);
    modalPool.releaseButton(confirmBtn);
    modalPool.releaseButton(cancelBtn);
    if (returnBtn) modalPool.releaseButton(returnBtn);
    
    // Remover del DOM
    overlay.remove();
  }
  
  // Animar entrada si está habilitada
  if (animation) {
    animateModalIn(overlay);
  }
  
  // Configurar teclas de acceso rápido
  setupKeyboardShortcuts(overlay, closeModal);
  
  performanceMonitor.end('createConfirmModal');
  
  return {
    overlay,
    modal,
    close: closeModal,
    remove: removeModal
  };
}

/**
 * Anima la entrada del modal
 */
function animateModalIn(overlay) {
  const modal = overlay.querySelector('.modal');
  
  // Estado inicial
  overlay.style.opacity = '0';
  modal.style.transform = 'scale(0.9) translateY(20px)';
  modal.style.opacity = '0';
  
  // Animar entrada
  requestAnimationFrame(() => {
    overlay.style.transition = `opacity ${MODAL_ANIMATION_CONFIG.duration}ms ${MODAL_ANIMATION_CONFIG.easing}`;
    modal.style.transition = `all ${MODAL_ANIMATION_CONFIG.duration}ms ${MODAL_ANIMATION_CONFIG.easing}`;
    
    overlay.style.opacity = '1';
    modal.style.transform = 'scale(1) translateY(0)';
    modal.style.opacity = '1';
  });
}

/**
 * Anima la salida del modal
 */
function animateModalOut(overlay, onComplete) {
  const modal = overlay.querySelector('.modal');
  
  overlay.style.transition = `opacity ${MODAL_ANIMATION_CONFIG.duration}ms ${MODAL_ANIMATION_CONFIG.easing}`;
  modal.style.transition = `all ${MODAL_ANIMATION_CONFIG.duration}ms ${MODAL_ANIMATION_CONFIG.easing}`;
  
  overlay.style.opacity = '0';
  modal.style.transform = 'scale(0.9) translateY(20px)';
  modal.style.opacity = '0';
  
  setTimeout(onComplete, MODAL_ANIMATION_CONFIG.duration);
}

/**
 * Configura atajos de teclado para el modal
 */
function setupKeyboardShortcuts(overlay, closeModal) {
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }
  };
  
  overlay.addEventListener('keydown', handleKeydown);
  overlay.setAttribute('tabindex', '-1');
  overlay.focus();
}

/**
 * Modal de confirmación de cierre optimizado
 * @param {Object} config - Configuración específica para cierre
 * @returns {Object} Modal optimizado
 */
export function createCloseConfirmationModal({
  message = 'Do you want to export your save before exiting?',
  onConfirm = null,
  onCancel = null,
  onReturn = null,
  container = null
}) {
  return createOptimizedConfirmModal({
    title: 'Exit Confirmation',
    message,
    onConfirm,
    onCancel,
    onReturn,
    container,
    confirmText: 'Exit',
    cancelText: 'Cancel',
    returnText: 'Return',
    confirmClass: 'btn btn-red',
    cancelClass: 'btn btn-green',
    returnClass: 'btn btn-blue',
    showReturn: !!onReturn,
    animation: true
  });
}

/**
 * Modal de confirmación de reset optimizado
 * @param {Object} config - Configuración específica para reset
 * @returns {Object} Modal optimizado
 */
export function createResetConfirmationModal({
  message = 'Are you sure you want to reset the game?',
  onConfirm = null,
  onCancel = null,
  container = null
}) {
  return createOptimizedConfirmModal({
    title: 'Reset Confirmation',
    message,
    onConfirm,
    onCancel,
    container,
    confirmText: 'Reset Game',
    cancelText: 'Cancel',
    confirmClass: 'btn btn-red',
    cancelClass: 'btn btn-green',
    animation: true
  });
}

/**
 * Modal de confirmación de acción optimizado
 * @param {Object} config - Configuración específica para acciones
 * @returns {Object} Modal optimizado
 */
export function createActionConfirmationModal({
  title = 'Confirm Action',
  message = '',
  onConfirm = null,
  onCancel = null,
  container = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmClass = 'btn btn-red',
  cancelClass = 'btn btn-green'
}) {
  return createOptimizedConfirmModal({
    title,
    message,
    onConfirm,
    onCancel,
    container,
    confirmText,
    cancelText,
    confirmClass,
    cancelClass,
    animation: true
  });
}

/**
 * Optimizador para modales existentes
 * Reemplaza la función openConfirm original con la versión optimizada
 */
export function optimizeExistingModals() {
  // Buscar y reemplazar la función openConfirm si existe
  if (typeof window.openConfirm === 'function') {
    window.openConfirm = function(config) {
      // Usar la versión optimizada
      return createOptimizedConfirmModal({
        ...config,
        animation: true
      });
    };
    
    console.log('🔄 openConfirm reemplazada con versión optimizada');
  }
  
  // Buscar y reemplazar en el scope global si es posible
  if (typeof window !== 'undefined') {
    // Intentar reemplazar en módulos comunes
    const commonModules = ['script', 'main', 'login'];
    
    commonModules.forEach(moduleName => {
      try {
        if (window[moduleName] && window[moduleName].openConfirm) {
          window[moduleName].openConfirm = function(config) {
            return createOptimizedConfirmModal({
              ...config,
              animation: true
            });
          };
          console.log(`🔄 openConfirm optimizada en módulo ${moduleName}`);
        }
      } catch {
        // Ignorar errores de módulos no accesibles
      }
    });
  }
}

/**
 * Configurar animaciones personalizadas
 */
export function configureModalAnimations(config) {
  Object.assign(MODAL_ANIMATION_CONFIG, config);
}

/**
 * Limpiar recursos del pool de modales
 */
export function cleanupModalPool() {
  modalPool.overlays.forEach(overlay => overlay.remove());
  modalPool.modals.forEach(modal => modal.remove());
  modalPool.buttons.forEach(button => button.remove());
  
  modalPool.overlays.length = 0;
  modalPool.modals.length = 0;
  modalPool.buttons.length = 0;
}

/**
 * Función de compatibilidad para reemplazar openConfirm existente
 */
export function replaceOpenConfirm() {
  // Buscar la función openConfirm en el scope global
  if (typeof window !== 'undefined') {
    // Crear un wrapper que use la versión optimizada
    window.openConfirm = function(config) {
      // Si es una confirmación de cierre, usar el modal específico
      if (config.message && config.message.includes('export your save before exiting')) {
        return createCloseConfirmationModal({
          message: config.message,
          onConfirm: config.onConfirm,
          onCancel: config.onCancel,
          onReturn: config.onReturn,
          container: config.container
        });
      }
      
      // Para otros tipos, usar el modal genérico optimizado
      return createOptimizedConfirmModal({
        ...config,
        animation: true
      });
    };
    
    console.log('✅ openConfirm reemplazada con versión optimizada');
    return true;
  }
  
  return false;
}

// Auto-inicializar optimizaciones cuando sea posible
if (typeof window !== 'undefined') {
  // Esperar a que se cargue el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(replaceOpenConfirm, 100);
    });
  } else {
    setTimeout(replaceOpenConfirm, 100);
  }
}
