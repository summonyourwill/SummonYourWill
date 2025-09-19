/**
 * Sistema de interacción fluida - Exportaciones principales
 * Mejora la experiencia del usuario con feedback visual inmediato
 */

// Utilidades principales
export {
  bindFluidClick,
  deferHeavyWork,
  deferToNextFrame,
  bindDelegatedClick,
  optimizeLayout,
  createFluidButton,
  bindFluidClickToSelector
} from './fluidClick';

// Utilidades de rendimiento (solo desarrollo)
export {
  markInput,
  measureExecution,
  measureRender,
  getPerformanceStats,
  clearPerformanceMetrics
} from './devPerf';

// Sistema de migración
export {
  migrateExistingButtons,
  migrateGroupMissionButtons,
  migrateHeroButtons,
  migrateMissionButtons,
  migrateSpecialBuilderButtons,
  applyFullMigration,
  setupAutoMigration
} from './migration';

// Sistema de inicialización
export {
  fluidInteraction,
  initFluidInteraction,
  getFluidInteractionStats,
  isFluidInteractionReady
} from './init';

// Tipos y interfaces
export type { PerformanceMetrics } from './devPerf';

// Re-exportar estilos CSS
export const CSS_FILE = './fluidInteraction.css';
