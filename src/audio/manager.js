import { getHowl, getHowler } from '../wrappers/howler.js';
import { lru } from '../cache.js';

// Cache of loaded Howl instances keyed by URL.
const sounds = {};
let masterVolume = 1;
const pomodoroHowls = new Set();
const SOUND_TTL = 60000;
let cleanupTimer;
let idleTimer;

function markUsed(url, sound) {
  sound._lastUsed = Date.now();
  scheduleCleanup();
  scheduleIdleUnload();
}

function scheduleCleanup() {
  clearTimeout(cleanupTimer);
  cleanupTimer = setTimeout(removeStale, SOUND_TTL);
}

function scheduleIdleUnload() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(unloadAllAudio, SOUND_TTL * 5);
}

function removeStale() {
  const now = Date.now();
  Object.entries(sounds).forEach(([url, sound]) => {
    if (now - (sound._lastUsed || 0) > SOUND_TTL) {
      try { if (typeof sound.unload === 'function') sound.unload(); } catch {}
      lru.delete(url);
      delete sounds[url];
    }
  });
  if (Object.keys(sounds).length) scheduleCleanup();
}

/**
 * Set the global volume multiplier applied to all sounds.
 *
 * @param {number} [v=1] Value between 0 and 1.
 * @returns {void}
 */
export function setMasterVolume(v = 1) {
  masterVolume = Math.max(0, Math.min(1, v));
  getHowl().then(Howl => {
    if (Howl && Howl.volume) Howl.volume(masterVolume);
  }).catch(() => {});
}

/**
 * Get the current master volume.
 *
 * @returns {number}
 */
export function getMasterVolume() {
  return masterVolume;
}

/**
 * Preload an array of audio URLs so playback starts without delay.
 *
 * @param {string[]} urls File URLs to preload.
 * @returns {void}
 */
export function preloadAudio(urls = []) {
  urls.forEach(async url => {
    if (!sounds[url]) {
      let sound = lru.get(url);
      if (!sound) {
        const Howl = await getHowl();
        sound = new Howl({ src: [url], html5: true, preload: 'metadata' });
        lru.set(url, sound);
      }
      sounds[url] = sound;
      markUsed(url, sound);
    }
  });
}

/**
 * Play a sound effect, loading it if necessary.
 *
 * @param {string} url Audio file to play.
 * @param {object} [opts] Playback options.
 * @param {number} [opts.volume=1] Volume multiplier.
 * @param {boolean} [opts.overlap=false] Allow overlapping playback.
 * @returns {Promise<void>} Resolves when the sound has started.
 */
export async function playSound(url, { volume = 1, overlap = false } = {}) {
  let sound = sounds[url] || lru.get(url);
  if (!sound) {
    const Howl = await getHowl();
    sound = new Howl({ src: [url], html5: true, preload: 'metadata' });
    lru.set(url, sound);
  }
  sounds[url] = sound;
  markUsed(url, sound);
  sound.volume(volume * masterVolume);
  if (!overlap) sound.stop();
  const id = sound.play();
  if (url.endsWith('arrow.mp3') || url.endsWith('fireball.mp3')) {
    setTimeout(() => {
      try { sound.stop(id); } catch {}
    }, 5000);
  }
  sound.once('end', () => {
    try { sound.unload(); } catch {}
    lru.delete(url);
    delete sounds[url];
  });
}

/**
 * Create a Howl instance that is tracked so pomodoro timers continue
 * playing even when the app is hidden.
 *
 * @param {import('howler').HowlOptions} options Howler configuration.
 * @returns {Promise<import('howler').Howl>} Loaded Howl.
 */
export async function createPomodoroHowl(options) {
  const Howl = await getHowl();
  const h = new Howl(options);
  pomodoroHowls.add(h);
  return h;
}

/**
 * Mute or resume audio based on window visibility.
 *
 * @param {boolean} hidden Whether the app is hidden.
 * @returns {Promise<void>}
 */
export async function onVisibilityChanged(hidden) {
  const Howler = await getHowler();
  const all = Howler._howls || [];
  all.forEach(h => {
    const isPomodoro = pomodoroHowls.has(h);
    h.mute(hidden && !isPomodoro);
  });
  try {
    // Keep audio context active whenever any Pomodoro-related sound exists,
    // so completion sounds play even if the app is minimized.
    const anyPomodoro = all.some(h => pomodoroHowls.has(h));
    if (!hidden || anyPomodoro) {
      if (Howler.ctx?.state === 'suspended') await Howler.ctx.resume();
    } else if (hidden && Howler.ctx?.state === 'running') {
      await Howler.ctx.suspend();
    }
  } catch {}
}

export { pomodoroHowls };

/**
 * Unload every cached Howl and clear the LRU cache.
 *
 * @returns {void}
 */
export function unloadAllAudio() {
  clearTimeout(cleanupTimer);
  clearTimeout(idleTimer);
  Object.entries(sounds).forEach(([url, sound]) => {
    try {
      if (sound && typeof sound.unload === 'function') {
        sound.unload();
      }
    } catch {}
    lru.delete(url);
    delete sounds[url];
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', unloadAllAudio);
}
