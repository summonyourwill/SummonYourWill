import { getHeroById } from "../heroes/index.js";

export let isMinigameActive = false;
let minigameStartTime = 0;
var getTimers = () => [];
var processTimers = () => {};

export function initMinigameControl(activeTimersGetter, processAllTimers) {
  getTimers = activeTimersGetter;
  processTimers = processAllTimers;
}

export function minigameOpened() {
  isMinigameActive = true;
  minigameStartTime = Date.now();
}

export function minigameClosed() {
  if (!isMinigameActive) return;
  isMinigameActive = false;
  const pauseMs = Date.now() - minigameStartTime;
  getTimers().forEach(t => {
    t.startTime += pauseMs;
    if (t.lastTick) t.lastTick += pauseMs;
    if (t.type === 'rest') {
      const hero = getHeroById(t.heroId);
      if (hero) {
        hero.restStartTime += pauseMs;
        hero.lastRestTick += pauseMs;
      }
    }
    if (t.type === 'mission') {
      const hero = getHeroById(t.heroId);
      if (hero) {
        hero.missionStartTime += pauseMs;
      }
    }
  });
  processTimers(Date.now());
}
