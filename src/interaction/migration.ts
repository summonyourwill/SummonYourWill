/**
 * Migración de botones existentes a interacción fluida
 * Aplica el sistema de interacción fluida a elementos existentes
 */

import { bindFluidClick, deferHeavyWork, bindDelegatedClick } from './fluidClick';
import { markInput } from './devPerf';

/**
 * Aplicar interacción fluida a botones existentes
 * @param container - Contenedor donde buscar botones
 */
export function migrateExistingButtons(container: HTMLElement = document.body) {
  // Botones principales del juego
  const buttonSelectors = [
    '.btn',
    'button',
    '[onclick]',
    '.hero-card',
    '.mission-slot',
    '.group-mission-card',
    '.special-builder-card',
    '.builder-avatar',
    '.hero-avatar',
    '.selectable-hero'
  ];

  buttonSelectors.forEach(selector => {
    const elements = container.querySelectorAll<HTMLElement>(selector);
    elements.forEach(el => {
      if (el.hasAttribute('data-fluid-migrated')) return; // Evitar migración duplicada
      
      migrateElement(el);
    });
  });
}

/**
 * Migrar un elemento específico
 * @param el - Elemento a migrar
 */
function migrateElement(el: HTMLElement) {
  // Marcar como migrado
  el.setAttribute('data-fluid-migrated', 'true');
  
  // Agregar clases CSS para estilos
  el.classList.add('interactive-element');
  
  // Si tiene onclick, migrarlo
  if (el.hasAttribute('onclick')) {
    const onclickValue = el.getAttribute('onclick');
    if (onclickValue) {
      // Crear función wrapper
      const action = (ev: Event) => {
        markInput('migrated-onclick');
        // Ejecutar el onclick original
        try {
          // Crear función temporal para ejecutar el onclick
          const tempFn = new Function('event', onclickValue);
          tempFn(ev);
        } catch (error) {
          console.warn('Error ejecutando onclick migrado:', error);
        }
      };
      
      // Aplicar interacción fluida
      bindFluidClick(el, action, {
        immediateFeedback: true,
        deferAction: true,
        preventDefault: false
      });
      
      // Limpiar onclick original
      el.removeAttribute('onclick');
    }
  }
  
  // Si es un botón de acción pesada, diferir el trabajo
  if (el.classList.contains('btn-heavy') || el.classList.contains('action-heavy')) {
    const originalClick = el.onclick;
    if (originalClick) {
      el.onclick = (ev) => {
        markInput('heavy-action');
        // Feedback inmediato
        el.classList.add('pressed');
        
        // Diferir trabajo pesado
        deferHeavyWork(() => {
          originalClick.call(el, ev);
          el.classList.remove('pressed');
        });
      };
    }
  }
}

/**
 * Migrar botones de Group Missions específicamente
 */
export function migrateGroupMissionButtons() {
  const groupMissionCards = document.querySelectorAll('.group-mission-card');
  
  groupMissionCards.forEach(card => {
    // Botones de selección de héroes
    const heroSelects = card.querySelectorAll('select');
    heroSelects.forEach(select => {
      if (!select.hasAttribute('data-fluid-migrated')) {
        select.setAttribute('data-fluid-migrated', 'true');
        select.classList.add('interactive-element');
      }
    });
    
    // Botones de acción
    const actionButtons = card.querySelectorAll('button');
    actionButtons.forEach(btn => {
      if (!btn.hasAttribute('data-fluid-migrated')) {
        migrateElement(btn);
      }
    });
  });
}

/**
 * Migrar botones de héroes
 */
export function migrateHeroButtons() {
  const heroCards = document.querySelectorAll('.hero-card');
  
  heroCards.forEach(card => {
    if (!card.hasAttribute('data-fluid-migrated')) {
      migrateElement(card);
      
      // Botones de acción dentro de la tarjeta
      const actionButtons = card.querySelectorAll('button');
      actionButtons.forEach(btn => {
        if (!btn.hasAttribute('data-fluid-migrated')) {
          migrateElement(btn);
        }
      });
    }
  });
}

/**
 * Migrar botones de misiones
 */
export function migrateMissionButtons() {
  const missionSlots = document.querySelectorAll('.mission-slot');
  
  missionSlots.forEach(slot => {
    if (!slot.hasAttribute('data-fluid-migrated')) {
      migrateElement(slot);
      
      // Botones de acción dentro del slot
      const actionButtons = slot.querySelectorAll('button');
      actionButtons.forEach(btn => {
        if (!btn.hasAttribute('data-fluid-migrated')) {
          migrateElement(btn);
        }
      });
    }
  });
}

/**
 * Migrar botones de Special Builder
 */
export function migrateSpecialBuilderButtons() {
  const builderCards = document.querySelectorAll('.special-builder-card');
  
  builderCards.forEach(card => {
    if (!card.hasAttribute('data-fluid-migrated')) {
      migrateElement(card);
      
      // Botones de acción dentro de la tarjeta
      const actionButtons = card.querySelectorAll('button');
      actionButtons.forEach(btn => {
        if (!btn.hasAttribute('data-fluid-migrated')) {
          migrateElement(btn);
        }
      });
    }
  });
}

/**
 * Aplicar migración completa
 */
export function applyFullMigration() {
  console.log('🚀 Aplicando migración a interacción fluida...');
  
  // Migrar elementos existentes
  migrateExistingButtons();
  
  // Migrar componentes específicos
  migrateGroupMissionButtons();
  migrateHeroButtons();
  migrateMissionButtons();
  migrateSpecialBuilderButtons();
  
  console.log('✅ Migración a interacción fluida completada');
}

/**
 * Configurar migración automática cuando el DOM esté listo
 */
export function setupAutoMigration() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFullMigration);
  } else {
    applyFullMigration();
  }
  
  // Migrar elementos que se agreguen dinámicamente
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.classList && element.classList.contains('hero-card')) {
            migrateHeroButtons();
          } else if (element.classList && element.classList.contains('group-mission-card')) {
            migrateGroupMissionButtons();
          } else if (element.classList && element.classList.contains('mission-slot')) {
            migrateMissionButtons();
          } else if (element.classList && element.classList.contains('special-builder-card')) {
            migrateSpecialBuilderButtons();
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
