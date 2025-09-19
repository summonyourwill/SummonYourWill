import state from '../src/state.js';
import { isBusy } from '../src/heroes/index.js';

export function isSectionVisible(id) {
  const el = document.getElementById(id);
  return el && el.style.display !== 'none';
}

export function showHeroSelector() {
  const selector = document.getElementById('villain-origin-selector');
  if (!selector) return;
  selector.innerHTML = state.heroes
    .filter(h => !isBusy(h) && h.energia >= 50)
    .map(h => `<option value="${h.id}">${h.name}</option>`)
    .join('');
  selector.selectedIndex = 0;
  selector.style.display = 'block';
}
