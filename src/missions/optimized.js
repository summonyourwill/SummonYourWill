// Versión optimizada del sistema de misiones
// Mantiene la funcionalidad exacta pero mejora el rendimiento

import {
  missions,
  heroes,
  heroMap,
  companions,
  farmers,
  lumberjacks,
  miners,
  autoClickActive,
  dailyMissions,
} from '../state.js';

import {
  startMission,
  saveGame,
  scheduleSaveGame,
  scheduleRenderHeroes,
  EMPTY_SRC,
  removeTimer,
} from '../../script.js';

import { renderDailyMissions } from '../dailyMissions.js';
import { isBusy } from '../heroes/index.js';
import {
  missionDescriptions,
  missionEnergyCost,
  missionDuration,
} from './utils.js';

import {
  debouncedRender,
  isHeroAvailable,
  clearOptimizationCache,
  performanceMonitor,
  globalEventOptimizer,
  divPool,
  buttonPool,
  selectPool,
  optionPool,
  optimizedUpdateElement
} from '../performance/missionOptimizer.js';

// Track DOM nodes for each mission so we can update/remove them individually
const missionDomMap = new Map();

// Cache para el estado de las misiones
const missionStateCache = new Map();

/**
 * Versión optimizada de renderMissions que mantiene la funcionalidad exacta
 */
export function renderMissionsOptimized() {
  performanceMonitor.start('renderMissions');
  
  const container = document.getElementById('missions');
  if (!container) return;
  
  const prevScrollTop = container.scrollTop;

  // Remove nodes for missions that no longer exist
  for (const [id, node] of missionDomMap.entries()) {
    if (!missions.some(m => m.id === id)) {
      node.remove();
      missionDomMap.delete(id);
      missionStateCache.delete(id);
    }
  }

  missions.forEach(slot => {
    renderSingleMissionOptimized(slot, container);
  });

  container.scrollTop = prevScrollTop;
  performanceMonitor.end('renderMissions');
}

/**
 * Renderiza una sola misión de forma optimizada
 */
function renderSingleMissionOptimized(slot, container) {
  let box = missionDomMap.get(slot.id);
  const isNew = !box;
  
  if (isNew) {
    box = divPool.get();
    missionDomMap.set(slot.id, box);
    container.appendChild(box);
  }
  
  // Determinar color de la misión (se mantiene igual)
  let colorClass = 'mission-green';
  if ([10, 12].includes(slot.id)) colorClass = 'mission-blue';
  else if ([4, 11].includes(slot.id)) colorClass = 'mission-gray';
  else if ([1, 7, 8, 14].includes(slot.id)) colorClass = 'mission-red';
  else if ([16, 18, 20].includes(slot.id)) colorClass = 'mission-orange';
  else if ([15, 17, 19, 21].includes(slot.id)) colorClass = 'mission-yellow';
  
  const newClassName = `mission-slot ${colorClass}`;
  
  // Solo actualizar si cambió
  if (box.className !== newClassName) {
    box.className = newClassName;
  }

  // Verificar pending hero
  if (slot.pendingHeroId) {
    const pendingHero = heroMap.get(slot.pendingHeroId);
    if (pendingHero && pendingHero.trainTime > 0) {
      // handled later when content is built
    } else if (pendingHero) {
      slot.heroId = pendingHero.id;
      slot.pendingHeroId = null;
      startMission(pendingHero, slot);
      return;
    }
  }

  // Generar un hash del estado actual para determinar si necesita actualización
  const currentState = `${slot.heroId}_${slot.completed}_${slot.pendingHeroId}_${slot.description}`;
  const cachedState = missionStateCache.get(slot.id);
  
  // Solo reconstruir el contenido si cambió el estado
  if (isNew || currentState !== cachedState) {
    missionStateCache.set(slot.id, currentState);
    buildMissionContent(box, slot);
  }
}

/**
 * Construye el contenido de una misión de forma optimizada
 */
function buildMissionContent(box, slot) {
  // Limpiar contenido anterior
  box.innerHTML = '';

  // Crear elementos base reutilizando el pool
  const title = divPool.get();
  title.className = "mission-title";
  title.textContent = `Mission ${slot.id}`;
  box.appendChild(title);

  const desc = divPool.get();
  desc.className = "mission-desc";
  desc.textContent = slot.description;
  box.appendChild(desc);

  const rewards = divPool.get();
  rewards.className = "mission-desc";
  const energyCost = missionEnergyCost(slot.id);
  rewards.textContent = `${slot.expReward} Gold - Energy: ${energyCost}%`;
  box.appendChild(rewards);

  if (slot.heroId) {
    buildHeroMissionContent(box, slot);
  } else {
    buildEmptyMissionContent(box, slot);
  }
}

/**
 * Construye el contenido para una misión con héroe asignado
 */
function buildHeroMissionContent(box, slot) {
  const hero = heroMap.get(slot.heroId);
  if (!hero) return;

  const name = divPool.get();
  name.textContent = hero.name;
  box.appendChild(name);

  const avatar = document.createElement("img");
  avatar.src = hero.avatar || EMPTY_SRC;
  avatar.className = "mission-avatar";
  if (!hero.avatar) avatar.classList.add("empty");
  box.appendChild(avatar);

  // Siempre mostrar timer y botón X cuando hay héroe asignado
  buildActiveMissionContent(box, slot, hero);
  
  if (slot.completed) {
    buildCompletedMissionContent(box, slot);
  }
}

/**
 * Construye el contenido para una misión activa
 */
function buildActiveMissionContent(box, slot, hero) {
  const timer = divPool.get();
  timer.className = "timer";
  timer.id = `mission-timer-${slot.id}`;
  
  const dur = missionDuration(slot.id);
  let label;
  switch (dur) {
    case 43200: label = '12h'; break;
    case 28800: label = '8h'; break;
    case 10800: label = '3h'; break;
    case 7200: label = '2h'; break;
    case 3600: label = '1h'; break;
    default: label = '30m';
  }
  timer.textContent = label;
  box.appendChild(timer);
  
  const stopBtn = buttonPool.get();
  stopBtn.textContent = "❌";
  stopBtn.style.background = "none";
  stopBtn.style.border = "none";
  stopBtn.style.color = "#c00";
  stopBtn.style.cursor = "pointer";
  stopBtn.style.marginLeft = "4px";
  
  // Usar el optimizador de eventos
  globalEventOptimizer.addOptimizedListener(stopBtn, 'click', () => {
    hero.missionTime = 0;
    hero.missionStartTime = 0;
    hero.missionDuration = 0;
    hero.state = { type: 'ready' };
    removeTimer(`mission_${slot.id}`);
    slot.heroId = null;
    slot.completed = false;
    slot.status = 'idle';
    slot.rewardApplied = false;
    slot.startedAt = null;
    slot.endAt = null;
    slot.durationMs = 0;
    slot.description = missionDescriptions[Math.floor(Math.random() * missionDescriptions.length)];
    
    // Limpiar cache y re-renderizar con debounce
    clearOptimizationCache();
    scheduleSaveGame();
    debouncedRender(() => {
      renderMissionsOptimized();
      scheduleRenderHeroes();
      renderDailyMissions();
    });
  }, `stop_mission_${slot.id}`);
  
  box.appendChild(stopBtn);
}

/**
 * Construye el contenido para una misión completada
 */
function buildCompletedMissionContent(box, slot) {
  const done = divPool.get();
  done.textContent = "Completed!";
  done.className = "mission-done";
  box.appendChild(done);
  
  // Si la recompensa no se ha aplicado, mostrar botón "Collect Reward"
  if (!slot.rewardApplied) {
    const collectBtn = buttonPool.get();
    collectBtn.textContent = "Collect Reward";
    collectBtn.className = "collect-reward-btn";
    collectBtn.style.cssText = "background: #4CAF50; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; margin: 4px; font-size: 0.9em;";
    
    globalEventOptimizer.addOptimizedListener(collectBtn, 'click', () => {
      import('../../script.js').then(m => {
        m.collectMissionReward(slot);
      });
    }, `collect_mission_${slot.id}`);
    
    box.appendChild(collectBtn);
    return; // No mostrar el botón de cerrar aún
  }
  
  const close = buttonPool.get();
  close.textContent = "❌";
  close.className = "close-btn";
  
  globalEventOptimizer.addOptimizedListener(close, 'click', () => {
    slot.heroId = null;
    slot.completed = false;
    slot.status = 'idle';
    slot.rewardApplied = false;
    slot.startedAt = null;
    slot.endAt = null;
    slot.durationMs = 0;
    slot.description = missionDescriptions[Math.floor(Math.random() * missionDescriptions.length)];
    
    clearOptimizationCache();
    scheduleSaveGame();
    debouncedRender(() => {
      renderMissionsOptimized();
      renderDailyMissions();
    });
  }, `close_mission_${slot.id}`);
  
  box.appendChild(close);
}

/**
 * Construye el contenido para una misión vacía
 */
function buildEmptyMissionContent(box, slot) {
  const avatar = divPool.get();
  avatar.className = "mission-avatar empty";
  box.appendChild(avatar);

  const select = selectPool.get();
  const opt = optionPool.get();
  opt.textContent = "Choose Hero";
  opt.value = "";
  select.appendChild(opt);

  const required = missionEnergyCost(slot.id);
  
  // Usar la función optimizada para obtener héroes disponibles
  const availableHeroes = heroes.filter(h => 
    isHeroAvailable(h, required, missions, dailyMissions, autoClickActive, companions, farmers, lumberjacks, miners, isBusy)
  );
  
  availableHeroes.forEach(h => {
    const option = optionPool.get();
    option.value = h.id;
    option.textContent = h.name;
    select.appendChild(option);
  });

  if (slot.pendingHeroId) {
    const pendingHero = heroMap.get(slot.pendingHeroId);
    if (pendingHero && pendingHero.trainTime > 0) {
      const note = divPool.get();
      note.className = 'mission-note';
      note.textContent = 'Currently training';
      box.appendChild(note);
    }
  }

  globalEventOptimizer.addOptimizedListener(select, 'change', (e) => {
    const id = parseInt(e.target.value);
    if (!id) return;
    
    const hero = heroMap.get(id);
    const existing = box.querySelector('.mission-note');
    if (existing) existing.remove();
    
    if (hero.energia < required) {
      const note = divPool.get();
      note.className = 'mission-note';
      note.textContent = `Hero Energy: ${hero.energia}%`;
      select.insertAdjacentElement('afterend', note);
      select.value = '';
      return;
    }
    
    if (hero.trainTime > 0) {
      slot.pendingHeroId = id;
      const note = divPool.get();
      note.className = 'mission-note';
      note.textContent = 'Currently training';
      select.insertAdjacentElement('afterend', note);
      scheduleSaveGame();
    } else {
      // NO asignar slot.heroId aquí - startMission lo hará
      startMission(hero, slot);
      // Forzar actualización inmediata después de asignar héroe
      setTimeout(() => {
        renderMissionsOptimized();
      }, 0);
    }
  }, `select_hero_${slot.id}`);

  box.appendChild(select);
}

/**
 * Función de renderizado con debounce automático
 */
export function scheduleOptimizedRender() {
  debouncedRender(renderMissionsOptimized);
}

/**
 * Limpiar recursos cuando sea necesario
 */
export function cleanupMissionOptimizations() {
  clearOptimizationCache();
  globalEventOptimizer.cleanup();
  missionStateCache.clear();
}
