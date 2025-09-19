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
} from './state.js';
import {
  startMission,
  saveGame,
  scheduleSaveGame,
  scheduleRenderHeroes,
  EMPTY_SRC,
  removeTimer,
} from '../script.js';
import { renderDailyMissions } from './dailyMissions.js';
import { isBusy } from './heroes/index.js';
import {
  missionDescriptions,
  missionEnergyCost,
  missionDuration,
} from './missions/utils.js';

// Track DOM nodes for each mission so we can update/remove them individually
const missionDomMap = new Map();

/**
 * Render all available missions to the DOM and wire up mission selection,
 * timers and completion handling. The function operates on the mutable
 * `missions` array imported from the main game script.
 *
 * @returns {void}
 */
export function renderMissions() {
  const container = document.getElementById('missions');
  if (!container) return;
  const prevScrollTop = container.scrollTop;

  // Remove nodes for missions that no longer exist
  for (const [id, node] of missionDomMap.entries()) {
    if (!missions.some(m => m.id === id)) {
      node.remove();
      missionDomMap.delete(id);
    }
  }

  missions.forEach(slot => {
    let box = missionDomMap.get(slot.id);
    const isNew = !box;
    if (isNew) {
      box = document.createElement('div');
      missionDomMap.set(slot.id, box);
      container.appendChild(box);
    }
    let colorClass = 'mission-green';
    if ([10, 12].includes(slot.id)) colorClass = 'mission-blue';
    else if ([4, 11].includes(slot.id)) colorClass = 'mission-gray';
    else if ([1, 7, 8, 14].includes(slot.id)) colorClass = 'mission-red';
    else if ([16, 18, 20].includes(slot.id)) colorClass = 'mission-orange';
    else if ([15, 17, 19, 21].includes(slot.id)) colorClass = 'mission-yellow';
    box.className = `mission-slot ${colorClass}`;

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

    box.innerHTML = '';

    const title = document.createElement("div");
    title.className = "mission-title";
    title.textContent = `Mission ${slot.id}`;
    box.appendChild(title);

    const desc = document.createElement("div");
    desc.className = "mission-desc";
    desc.textContent = slot.description;
    box.appendChild(desc);

    const rewards = document.createElement("div");
    rewards.className = "mission-desc";
    const energyCost = missionEnergyCost(slot.id);
    rewards.textContent = `${slot.expReward} Gold - Energy: ${energyCost}%`;
    box.appendChild(rewards);

    if (slot.heroId) {
      const hero = heroMap.get(slot.heroId);
      if (hero) {
        const name = document.createElement("div");
        name.textContent = hero.name;
        box.appendChild(name);

        const avatar = document.createElement("img");
        avatar.src = hero.avatar || EMPTY_SRC;
        avatar.className = "mission-avatar";
        if (!hero.avatar) avatar.classList.add("empty");
        box.appendChild(avatar);

        if (hero.missionTime > 0) {
          const timer = document.createElement("div");
          timer.className = "timer";
          timer.id = `mission-timer-${slot.id}`;
          const dur = missionDuration(slot.id);
          let label;
          switch (dur) {
            case 43200:
              label = '12h';
              break;
            case 28800:
              label = '8h';
              break;
            case 10800:
              label = '3h';
              break;
            case 7200:
              label = '2h';
              break;
            case 3600:
              label = '1h';
              break;
            default:
              label = '30m';
          }
          timer.textContent = label;
          box.appendChild(timer);
          const stopBtn = document.createElement("button");
          stopBtn.textContent = "❌";
          stopBtn.style.background = "none";
          stopBtn.style.border = "none";
          stopBtn.style.color = "#c00";
          stopBtn.style.cursor = "pointer";
          stopBtn.style.marginLeft = "4px";
          stopBtn.onclick = () => {
            console.log('🚫 Cancelando misión - Estado ANTES:', {
              villageChief: { level: window.villageChief?.level, exp: window.villageChief?.exp, name: window.villageChief?.name },
              partner: { level: window.partner?.level, exp: window.partner?.exp, name: window.partner?.name }
            });
            
            hero.missionTime = 0;
            hero.missionStartTime = 0;
            hero.missionDuration = 0;
            hero.state = { type: 'ready' };
            removeTimer(`mission_${slot.id}`);
            slot.heroId = null;
            slot.completed = false;
            slot.description = missionDescriptions[Math.floor(Math.random() * missionDescriptions.length)];
            
            console.log('🚫 Cancelando misión - Estado DESPUÉS de limpiar misión:', {
              villageChief: { level: window.villageChief?.level, exp: window.villageChief?.exp, name: window.villageChief?.name },
              partner: { level: window.partner?.level, exp: window.partner?.exp, name: window.partner?.name }
            });
            
            scheduleSaveGame();
            renderMissions();
            scheduleRenderHeroes();
            renderDailyMissions();
          };
          box.appendChild(stopBtn);
        } else if (slot.completed) {
          const done = document.createElement("div");
          done.textContent = "Completed!";
          done.className = "mission-done";
          box.appendChild(done);
          const close = document.createElement("button");
          close.textContent = "❌";
          close.className = "close-btn";
          close.onclick = () => {
            slot.heroId = null;
            slot.completed = false;
            slot.description = missionDescriptions[Math.floor(Math.random() * missionDescriptions.length)];
            scheduleSaveGame();
            renderMissions();
            renderDailyMissions();
          };
          box.appendChild(close);
        }
      }
    } else {
      const avatar = document.createElement("div");
      avatar.className = "mission-avatar empty";
      box.appendChild(avatar);

      const select = document.createElement("select");
      const opt = document.createElement("option");
      opt.textContent = "Choose Hero";
      opt.value = "";
      select.appendChild(opt);

      const required = missionEnergyCost(slot.id);
      heroes.forEach(h => {
        const alreadyUsed =
          missions.some(m => m.heroId === h.id) ||
          Object.values(dailyMissions).some(arr => arr.some(m => m.heroId === h.id));
        const isAutoClicking =
          autoClickActive &&
          (companions.includes(h.id) ||
            farmers.includes(h.id) ||
            lumberjacks.includes(h.id) ||
            miners.includes(h.id));
        if (!isBusy(h) && !alreadyUsed && h.energia >= required && !isAutoClicking) {
          const option = document.createElement("option");
          option.value = h.id;
          option.textContent = h.name;
          select.appendChild(option);
        }
      });

      if (slot.pendingHeroId) {
        const pendingHero = heroMap.get(slot.pendingHeroId);
        if (pendingHero && pendingHero.trainTime > 0) {
          const note = document.createElement('div');
          note.className = 'mission-note';
          note.textContent = 'Currently training';
          box.appendChild(note);
        }
      }

      select.onchange = e => {
        const id = parseInt(e.target.value);
        if (!id) return;
        const hero = heroMap.get(id);
        const existing = box.querySelector('.mission-note');
        if (existing) existing.remove();
        if (hero.energia < required) {
          const note = document.createElement('div');
          note.className = 'mission-note';
          note.textContent = `Hero Energy: ${hero.energia}%`;
          select.insertAdjacentElement('afterend', note);
          select.value = '';
          return;
        }
        if (hero.trainTime > 0) {
          slot.pendingHeroId = id;
          const note = document.createElement('div');
          note.className = 'mission-note';
          note.textContent = 'Currently training';
          select.insertAdjacentElement('afterend', note);
          scheduleSaveGame();
        } else {
          slot.heroId = id;
          startMission(hero, slot);
        }
      };

      box.appendChild(select);
    }

  });

  container.scrollTop = prevScrollTop;
}
