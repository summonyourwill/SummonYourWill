/**
 * Constantes de tiempo para optimización de rendimiento
 * Todas las actualizaciones y renderizados deben ejecutarse como mínimo cada 1 minuto
 */

// Constantes básicas de tiempo
export const MIN = 60_000;        // 1 minuto en milisegundos
export const HOUR = 60 * MIN;     // 1 hora en milisegundos
export const HALF_HOUR = 30 * MIN; // 30 minutos en milisegundos

// Constante específica para entrenamiento de Stats
export const TRAIN_TIMER_MINUTES = 3; // Duración del entrenamiento en minutos

// Constantes específicas para diferentes sistemas
export const TIMER_INTERVALS = {
  // Timer principal del juego
  MAIN_GAME: MIN,
  
  // Special Builder (slots)
  SPECIAL_BUILDER: HOUR,
  
  // Misiones de grupo
  GROUP_MISSIONS: HALF_HOUR,
  
  // Corrección de héroes
  HERO_CORRECTION: MIN,
  
  // Limpieza de estado de construcción
  BUILD_STATUS_CLEANUP: 3 * MIN,
  
  // Minijuegos
  MINIGAME_BULLETS: MIN,
  MINIGAME_COUNTDOWN: MIN,
  
  // Monitoreo de memoria
  MEMORY_STATS: MIN,
  
  // Otros minijuegos
  // NOTA: Los siguientes minijuegos mantienen 1000ms para funcionalidad:
  // - POMODORO_TOWER: Minijuego que requiere actualización cada segundo
  // - SILENCE_TEMPLE: Minijuego de respiración que requiere actualización cada segundo
  // - GHOST_FARM: Minijuego animado que requiere fluidez visual
  // - PET_EXPLORATION: Minijuego animado que requiere fluidez visual
  // - CHIEF_SURVIVAL: Minijuego animado que requiere fluidez visual
  // - GIANT_BOSS: Minijuego animado que requiere fluidez visual
  // - ENEMY_ENCOUNTER: Minijuego animado que requiere fluidez visual
  // - FORTUNE_WHEEL: Minijuego animado que requiere fluidez visual
};

// Función para alinear timers al inicio del minuto (opcional)
export function startMinuteAligned(fn, interval = MIN) {
  const delay = interval - (Date.now() % interval);
  setTimeout(() => {
    fn();
    setInterval(fn, interval);
  }, delay);
}

// Funciones para el sistema de entrenamiento de Stats
export function calculateTrainingTimeRemaining(endAt) {
  if (!endAt) return 0;
  const now = Date.now();
  const remaining = Math.max(0, endAt - now);
  return Math.ceil(remaining / MIN); // Retorna minutos restantes
}

export function formatTrainingTime(minutes) {
  if (minutes <= 0) return "Ready";
  return `${minutes}m`;
}

export function isTrainingComplete(endAt) {
  if (!endAt) return true;
  return Date.now() >= endAt;
}

export function getTrainingEndTime(minutes = TRAIN_TIMER_MINUTES) {
  return Date.now() + (minutes * MIN);
}

// Función para calcular minutos restantes (para countdowns)
export function minutesLeft(deadline) {
  const diff = Math.max(0, deadline - Date.now());
  return Math.ceil(diff / MIN); // 3m, 2m, 1m, 0m
}

// Función para renderizar labels de mejora por minuto
export function renderImproveLabel(el, deadline) {
  const m = minutesLeft(deadline);
  el.textContent = m > 0 ? `${m}m` : `Listo`;
}

// Función para crear un ticker único que actualice todos los labels de mejora
export function attachImproveMinuteTicker(getAllImproveItems) {
  clearInterval(globalThis.__improveTicker);
  const tick = () => {
    const items = getAllImproveItems(); // [{el, deadline}, ...]
    for (const { el, deadline } of items) renderImproveLabel(el, deadline);
  };
  tick(); // actualización inicial
  globalThis.__improveTicker = setInterval(tick, MIN);
}
