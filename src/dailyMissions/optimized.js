// Versión optimizada de misiones diarias
// Mantiene la funcionalidad exacta pero mejora el rendimiento

import state from '../state.js';
import { missionDescriptions } from '../missions/utils.js';
import { isBusy } from '../heroes/index.js';
import { renderMissions } from '../missions.js';
import { scheduleRenderHeroes, addTimer, removeTimer, scheduleSaveGame, EMPTY_SRC } from '../../script.js';

import {
  debouncedRender,
  isHeroAvailable,
  clearOptimizationCache,
  performanceMonitor,
  globalEventOptimizer,
  divPool,
  buttonPool,
  selectPool,
  optionPool
} from '../performance/missionOptimizer.js';

// Cache para evitar recreación de elementos
const dailyMissionCache = new Map();

/**
 * Función optimizada de renderDailyButtons
 */
export function renderDailyButtonsOptimized(cardId, card2Id, onOpen) {
  performanceMonitor.start('renderDailyButtons');
  
  const card = document.getElementById(cardId);
  const card2 = document.getElementById(card2Id);
  if (!card || !card2) return;
  
  card.innerHTML = '';
  card2.innerHTML = '';
  card.style.display = 'grid';
  card.style.gridTemplateColumns = 'repeat(7, 1fr)';
  card.style.gap = '4px';
  
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const today = (new Date().getDay() + 6) % 7;
  
  days.forEach((d, i) => {
    const b = buttonPool.get();
    b.textContent = d;
    b.className = 'btn btn-green white-text';
    b.style.color = '#000';
    b.style.background = i === today ? '#90ee90' : '#cfeecf';
    
    globalEventOptimizer.addOptimizedListener(b, 'click', () => {
      if (card2.style.display !== 'none' && card2.dataset.day === d) {
        card2.style.display = 'none';
        card2.dataset.day = '';
      } else {
        card2.dataset.day = d;
        card2.style.display = 'flex';
        if (onOpen) onOpen(d);
      }
    }, `daily_button_${d}`);
    
    card.appendChild(b);
  });
  
  const close = buttonPool.get();
  close.textContent = '❌';
  close.className = 'close-btn';
  
  globalEventOptimizer.addOptimizedListener(close, 'click', () => { 
    card2.style.display = 'none'; 
    card2.dataset.day = ''; 
  }, 'daily_close_btn');
  
  card2.appendChild(close);
  card2.style.display = 'none';
  
  performanceMonitor.end('renderDailyButtons');
}

/**
 * Función optimizada para startDailyMission
 */
export function startDailyMissionOptimized(hero, slot) {
  if (isBusy(hero)) return;
  
  const duration = 21600;
  const now = Date.now();
  hero.missionTime = duration;
  hero.missionDuration = duration;
  hero.missionStartTime = now;
  slot.heroId = hero.id;
  slot.completedHeroId = null;
  slot.assignedWeek = getWeekKey(new Date());
  
  addTimer({
    id: `daily_${slot.id}`,
    type: 'dailyMission',
    heroId: hero.id,
    slotId: slot.id,
    startTime: now,
    duration: duration * 1000,
    paused: false,
    completed: false
  });
  
  // Usar renderizado con debounce
  scheduleRenderHeroes();
  debouncedRender(() => {
    renderMissions();
    renderDailyMissionsOptimized();
  });
  scheduleSaveGame();
}

/**
 * Función optimizada para renderDailyMissionDay
 */
export function renderDailyMissionDayOptimized(day) {
  performanceMonitor.start('renderDailyMissionDay');
  
  initDailyMissions(day);
  const card = document.getElementById('daily-missions-card-2');
  if (!card) return;
  
  card.innerHTML = '';
  card.style.display = 'flex';
  card.style.justifyContent = 'center';
  card.style.gap = '10px';
  
  const close = buttonPool.get();
  close.textContent = '❌';
  close.className = 'close-btn';
  
  globalEventOptimizer.addOptimizedListener(close, 'click', () => { 
    card.style.display = 'none'; 
  }, 'daily_mission_close');
  
  card.appendChild(close);
  
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const todayIdx = (new Date().getDay() + 6) % 7;
  const dayIdx = days.indexOf(day);
  
  state.dailyMissions[day].forEach(slot => {
    const box = renderSingleDailyMissionOptimized(slot, dayIdx, todayIdx);
    card.appendChild(box);
  });
  
  performanceMonitor.end('renderDailyMissionDay');
}

/**
 * Renderiza una sola misión diaria de forma optimizada
 */
function renderSingleDailyMissionOptimized(slot, dayIdx, todayIdx) {
  const box = divPool.get();
  box.className = 'mission-slot daily-mission-slot';
  if (slot.index <= 3) box.classList.add('wide');
  
  const title = divPool.get();
  title.className = 'mission-title';
  title.textContent = `Daily Mission ${slot.index}`;
  box.appendChild(title);
  
  const desc = divPool.get();
  desc.className = 'mission-desc';
  desc.textContent = slot.description;
  box.appendChild(desc);
  
  const rewards = divPool.get();
  rewards.className = 'mission-desc';
  rewards.textContent = '5000 Gold - Energy: 50%';
  box.appendChild(rewards);
  
  if (slot.heroId) {
    buildDailyHeroContent(box, slot, dayIdx, todayIdx);
  } else if (slot.completed) {
    buildDailyCompletedContent(box, slot);
  } else {
    buildDailyEmptyContent(box, slot, dayIdx, todayIdx);
  }
  
  return box;
}

/**
 * Construye contenido para misión diaria completada
 */
function buildDailyCompletedContent(box, slot) {
  // Si la recompensa no se ha aplicado, mostrar botón "Collect Reward"
  if (!slot.rewardApplied) {
    const collectBtn = buttonPool.get();
    collectBtn.textContent = 'Collect Reward';
    collectBtn.className = 'collect-reward-btn';
    collectBtn.style.cssText = "background: #4CAF50; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; margin: 4px; font-size: 0.9em;";
    
    globalEventOptimizer.addOptimizedListener(collectBtn, 'click', () => {
      import('../../script.js').then(m => {
        m.collectDailyMissionReward(slot);
      });
    }, `collect_daily_${slot.id}`);
    
    box.appendChild(collectBtn);
    return; // No mostrar el contenido de héroe completado aún
  }
  
  const finHero = state.heroMap.get(slot.completedHeroId);
  if (finHero) {
    const name = divPool.get();
    name.textContent = finHero.name;
    box.appendChild(name);
    
    const avatar = imgPool.get();
    avatar.src = finHero.avatar || EMPTY_SRC;
    avatar.className = 'mission-avatar';
    if (!finHero.avatar) avatar.classList.add('empty');
    box.appendChild(avatar);
  }
  
  const done = divPool.get();
  done.textContent = 'Completed!';
  done.className = 'mission-done';
  box.appendChild(done);
}

/**
 * Construye contenido para misión diaria con héroe
 */
function buildDailyHeroContent(box, slot, dayIdx, todayIdx) {
  const hero = state.heroMap.get(slot.heroId);
  if (!hero) return;
  
  const name = divPool.get();
  name.textContent = hero.name;
  box.appendChild(name);
  
  const avatar = document.createElement('img');
  avatar.src = hero.avatar || EMPTY_SRC;
  avatar.className = 'mission-avatar';
  if (!hero.avatar) avatar.classList.add('empty');
  box.appendChild(avatar);
  
  if (hero.missionTime > 0) {
    buildDailyActiveContent(box, slot, hero);
  } else if (slot.completed) {
    buildDailyHeroCompletedContent(box, slot);
  }
}

/**
 * Construye contenido para misión diaria activa
 */
function buildDailyActiveContent(box, slot, hero) {
  const dur = divPool.get();
  dur.className = 'mission-desc';
  dur.id = `daily-mission-timer-${slot.id}`;
  const hours = Math.ceil(hero.missionTime / 3600);
  dur.textContent = `${hours}H`;
  dur.style.marginBottom = '0';
  dur.style.minHeight = '0';
  box.appendChild(dur);
  
  const stopBtn = buttonPool.get();
  stopBtn.textContent = '❌';
  stopBtn.style.background = 'none';
  stopBtn.style.border = 'none';
  stopBtn.style.color = '#c00';
  stopBtn.style.cursor = 'pointer';
  stopBtn.style.marginTop = '0';
  
  globalEventOptimizer.addOptimizedListener(stopBtn, 'click', () => {
    hero.missionTime = 0;
    hero.missionStartTime = 0;
    hero.missionDuration = 0;
    hero.state = { type: 'ready' };
    removeTimer(`daily_${slot.id}`);
    slot.heroId = null;
    slot.completed = false;
    slot.completedHeroId = null;
    
    clearOptimizationCache();
    scheduleSaveGame();
    
    debouncedRender(() => {
      renderDailyMissionsOptimized();
      scheduleRenderHeroes();
      renderMissions();
    });
  }, `daily_stop_${slot.id}`);
  
  box.appendChild(stopBtn);
}

/**
 * Construye contenido para misión diaria completada con héroe
 * (Esta función ya no se usa - ahora todo se maneja en buildDailyCompletedContent)
 */
function buildDailyHeroCompletedContent(box, slot) {
  // Redirigir a la función principal que maneja ambos casos
  buildDailyCompletedContent(box, slot);
}

/**
 * Construye contenido para misión diaria vacía
 */
function buildDailyEmptyContent(box, slot, dayIdx, todayIdx) {
  const avatar = divPool.get();
  avatar.className = 'mission-avatar empty';
  box.appendChild(avatar);
  
  const select = selectPool.get();
  const opt = optionPool.get();
  opt.textContent = 'Choose Hero';
  opt.value = '';
  select.appendChild(opt);
  
  const required = 50;
  
  // Usar función optimizada para obtener héroes disponibles
  const availableHeroes = state.heroes.filter(h => 
    isHeroAvailable(h, required, state.missions, state.dailyMissions, state.autoClickActive, 
                   state.companions, state.farmers, state.lumberjacks, state.miners, isBusy)
  );
  
  availableHeroes.forEach(h => {
    const option = optionPool.get();
    option.value = h.id;
    option.textContent = h.name;
    select.appendChild(option);
  });
  
  globalEventOptimizer.addOptimizedListener(select, 'change', (e) => {
    const id = parseInt(e.target.value);
    if (!id) return;
    
    const hero = state.heroMap.get(id);
    slot.heroId = id;
    startDailyMissionOptimized(hero, slot);
  }, `daily_select_${slot.id}`);
  
  if (dayIdx !== todayIdx) select.disabled = true;
  box.appendChild(select);
}

/**
 * Función optimizada para renderDailyMissions
 */
export function renderDailyMissionsOptimized() {
  performanceMonitor.start('renderDailyMissions');
  
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  days.forEach(initDailyMissions);
  
  renderDailyButtonsOptimized('daily-missions-card','daily-missions-card-2', day => { 
    renderDailyMissionDayOptimized(day); 
  });
  
  const card2 = document.getElementById('daily-missions-card-2');
  const todayIdx = (new Date().getDay() + 6) % 7;
  renderDailyMissionDayOptimized(days[todayIdx]);
  if (card2) card2.style.display = 'flex';
  
  performanceMonitor.end('renderDailyMissions');
}

// Reutilizar funciones existentes que no necesitan optimización
export function getWeekKey(date) {
  const d = new Date(date);
  const one = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - one) / 86400000 + one.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function getDailyMissionSlot(id) {
  for (const day in state.dailyMissions) {
    const slot = state.dailyMissions[day].find(s => s.id === id);
    if (slot) return slot;
  }
  return null;
}

export function initDailyMissions(day) {
  if (!state.dailyMissions[day]) {
    state.dailyMissions[day] = Array.from({ length: 3 }, (_, i) => ({
      id: `${day}-${i + 1}`,
      index: i + 1,
      heroId: null,
      completed: false,
      completedWeek: null,
      description: missionDescriptions[Math.floor(Math.random() * missionDescriptions.length)]
    }));
  }
  const weekKey = getWeekKey(new Date());
  state.dailyMissions[day].forEach(slot => {
    const hero = slot.heroId ? state.heroMap.get(slot.heroId) : null;
    const active = hero && hero.missionTime > 0;
    if (slot.completedWeek !== weekKey && !active) {
      slot.completed = false;
      slot.heroId = null;
      slot.completedHeroId = null;
    }
    if (!slot.description) slot.description = missionDescriptions[Math.floor(Math.random() * missionDescriptions.length)];
  });
}

/**
 * Función para programar renderizado con debounce
 */
export function scheduleOptimizedDailyRender() {
  debouncedRender(renderDailyMissionsOptimized);
}
