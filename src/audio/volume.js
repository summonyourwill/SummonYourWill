import { setMasterVolume } from "./manager.js";

export let soundVolume = parseFloat(localStorage.getItem('soundVolume') || '1');
setMasterVolume(soundVolume);

export function setSoundVolume(v) {
  soundVolume = Math.max(0, Math.min(1, v));
  setMasterVolume(soundVolume);
  localStorage.setItem('soundVolume', String(soundVolume));
}
