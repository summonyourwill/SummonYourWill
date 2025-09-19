import state from './state.js';
import { missionDescriptions } from './missions/utils.js';
import { isBusy } from './heroes/index.js';
import { renderMissions } from './missions.js';
import { scheduleRenderHeroes, addTimer, removeTimer, scheduleSaveGame, EMPTY_SRC } from '../script.js';

export function renderDailyButtons(cardId, card2Id, onOpen) {
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
    const b = document.createElement('button');
    b.textContent = d;
    b.className = 'btn btn-green white-text';
    b.style.color = '#000';
    b.style.background = i === today ? '#90ee90' : '#cfeecf';
    b.onclick = () => {
      if (card2.style.display !== 'none' && card2.dataset.day === d) {
        card2.style.display = 'none';
        card2.dataset.day = '';
      } else {
        card2.dataset.day = d;
        card2.style.display = 'flex';
        if (onOpen) onOpen(d);
      }
    };
    card.appendChild(b);
  });
  const close = document.createElement('button');
  close.textContent = '❌';
  close.className = 'close-btn';
  close.onclick = () => { card2.style.display = 'none'; card2.dataset.day = ''; };
  card2.appendChild(close);
  card2.style.display = 'none';
}

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

export function startDailyMission(hero, slot) {
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
  scheduleRenderHeroes();
  renderMissions();
  renderDailyMissions();
  scheduleSaveGame();
}

export function renderDailyMissionDay(day) {
  initDailyMissions(day);
  const card = document.getElementById('daily-missions-card-2');
  if (!card) return;
  card.innerHTML = '';
  card.style.display = 'flex';
  card.style.justifyContent = 'center';
  card.style.gap = '10px';
  const close = document.createElement('button');
  close.textContent = '❌';
  close.className = 'close-btn';
  close.onclick = () => { card.style.display = 'none'; };
  card.appendChild(close);
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const todayIdx = (new Date().getDay() + 6) % 7;
  const dayIdx = days.indexOf(day);
  state.dailyMissions[day].forEach(slot => {
    const box = document.createElement('div');
    box.className = 'mission-slot daily-mission-slot';
    if (slot.index <= 3) box.classList.add('wide');
    const title = document.createElement('div');
    title.className = 'mission-title';
    title.textContent = `Daily Mission ${slot.index}`;
    box.appendChild(title);
    const desc = document.createElement('div');
    desc.className = 'mission-desc';
    desc.textContent = slot.description;
    box.appendChild(desc);
    const rewards = document.createElement('div');
    rewards.className = 'mission-desc';
    rewards.textContent = '5000 Gold - Energy: 50%';
    box.appendChild(rewards);
    if (slot.heroId) {
      const hero = state.heroMap.get(slot.heroId);
      if (hero) {
        const name = document.createElement('div');
        name.textContent = hero.name;
        box.appendChild(name);
        const avatar = document.createElement('img');
        avatar.src = hero.avatar || EMPTY_SRC;
        avatar.className = 'mission-avatar';
        if (!hero.avatar) avatar.classList.add('empty');
        box.appendChild(avatar);
        if (hero.missionTime > 0) {
          const dur = document.createElement('div');
          dur.className = 'mission-desc';
          dur.id = `daily-mission-timer-${slot.id}`;
          const hours = Math.ceil(hero.missionTime / 3600);
          dur.textContent = `${hours}H`;
          dur.style.marginBottom = '0';
          dur.style.minHeight = '0';
          box.appendChild(dur);
          const stopBtn = document.createElement('button');
          stopBtn.textContent = '❌';
          stopBtn.style.background = 'none';
          stopBtn.style.border = 'none';
          stopBtn.style.color = '#c00';
          stopBtn.style.cursor = 'pointer';
          stopBtn.style.marginTop = '0';
          stopBtn.onclick = () => {
            hero.missionTime = 0;
            hero.missionStartTime = 0;
            hero.missionDuration = 0;
            hero.state = { type: 'ready' };
            removeTimer(`daily_${slot.id}`);
            slot.heroId = null;
            slot.completed = false;
            slot.completedHeroId = null;
            scheduleSaveGame();
            renderDailyMissions();
            scheduleRenderHeroes();
            renderMissions();
          };
          box.appendChild(stopBtn);
        } else if (slot.completed) {
          const done = document.createElement('div');
          const finHero = state.heroMap.get(slot.completedHeroId);
          if (finHero) {
            const name = document.createElement('div');
            name.textContent = finHero.name;
            box.appendChild(name);
            const avatar = document.createElement('img');
            avatar.src = finHero.avatar || EMPTY_SRC;
            avatar.className = 'mission-avatar';
            if (!finHero.avatar) avatar.classList.add('empty');
            box.appendChild(avatar);
          }
          done.textContent = 'Completed!';
          done.className = 'mission-done';
          box.appendChild(done);
        }
      }
    } else if (slot.completed) {
      const finHero = state.heroMap.get(slot.completedHeroId);
      if (finHero) {
        const name = document.createElement('div');
        name.textContent = finHero.name;
        box.appendChild(name);
        const avatar = document.createElement('img');
        avatar.src = finHero.avatar || EMPTY_SRC;
        avatar.className = 'mission-avatar';
        if (!finHero.avatar) avatar.classList.add('empty');
        box.appendChild(avatar);
      }
      const done = document.createElement('div');
      done.textContent = 'Completed!';
      done.className = 'mission-done';
      box.appendChild(done);
    } else {
      const avatar = document.createElement('div');
      avatar.className = 'mission-avatar empty';
      box.appendChild(avatar);
      const select = document.createElement('select');
      const opt = document.createElement('option');
      opt.textContent = 'Choose Hero';
      opt.value = '';
      select.appendChild(opt);
      const required = 50;
      state.heroes.forEach(h => {
        const alreadyUsed =
          Object.values(state.dailyMissions).some(arr => arr.some(m => m.heroId === h.id)) ||
          state.missions.some(m => m.heroId === h.id);
        const isAutoClicking =
          state.autoClickActive &&
          (state.companions.includes(h.id) ||
            state.farmers.includes(h.id) ||
            state.lumberjacks.includes(h.id) ||
            state.miners.includes(h.id));
        if (!isBusy(h) && !alreadyUsed && h.energia >= required && !isAutoClicking) {
          const option = document.createElement('option');
          option.value = h.id;
          option.textContent = h.name;
          select.appendChild(option);
        }
      });
      select.onchange = e => {
        const id = parseInt(e.target.value);
        if (!id) return;
        const hero = state.heroMap.get(id);
        slot.heroId = id;
        startDailyMission(hero, slot);
      };
      if (dayIdx !== todayIdx) select.disabled = true;
      box.appendChild(select);
    }
    card.appendChild(box);
  });
}

export function renderDailyMissions() {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  days.forEach(initDailyMissions);
  renderDailyButtons('daily-missions-card','daily-missions-card-2', day => { renderDailyMissionDay(day); });
  const card2 = document.getElementById('daily-missions-card-2');
  const todayIdx = (new Date().getDay() + 6) % 7;
  renderDailyMissionDay(days[todayIdx]);
  if (card2) card2.style.display = 'flex';
}
