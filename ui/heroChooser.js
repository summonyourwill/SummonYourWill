import { createVirtualList } from './virtualList.js';
import { decodeHeroImgLazy } from './lazyImg.js';
import { debounce } from '../utils/perf.js';
import { pauseGroup, resumeGroup } from '../core/timerHub.js';

export function openHeroChooser({ heroes, onSelect }) {
  const modal = document.querySelector('#hero-chooser-modal');
  if (!modal) return;
  const listEl = modal.querySelector('.hero-list');
  const searchEl = modal.querySelector('input[type="search"]');

  const vlist = createVirtualList({
    container: listEl,
    rowHeight: 56,
    overscan: 6,
    renderRow(node, hero) {
      if (!node._built) {
        node.className = 'row flex items-center gap-2 px-2';
        node.innerHTML = `
          <img class="h-8 w-8 rounded bg-neutral-200" loading="lazy" />
          <div class="grow truncate text-sm"></div>
          <button class="choose-btn text-xs px-2 py-1">Choose</button>
        `;
        node._img = node.querySelector('img');
        node._name = node.querySelector('div');
        node._btn = node.querySelector('button');
        node._btn.addEventListener('click', () => onSelect(hero));
        node._built = true;
      }
      node._name.textContent = hero.displayName;
      node._img.dataset.src = hero.avatarThumb;
      decodeHeroImgLazy(node._img);
    },
  });

  let current = heroes.map((h) => ({
    id: h.id,
    displayName: h.name,
    avatarThumb: h.avatarThumb || h.avatarUrl,
    _q: (h.name || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''),
  }));
  vlist.setData(current);

  const debouncedFilter = debounce((q) => {
    if (!q) return vlist.setData(current);
    const n = q.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const filtered = current.filter((h) => h._q.includes(n));
    vlist.setData(filtered);
  });
  searchEl.addEventListener('input', (e) => debouncedFilter(e.target.value));

  modal.classList.remove('hidden');
  document.dispatchEvent(new CustomEvent('ui:modal-open', { detail: { id: 'hero-chooser' } }));

  function closeModal() {
    modal.classList.add('hidden');
    document.dispatchEvent(new CustomEvent('ui:modal-close', { detail: { id: 'hero-chooser' } }));
  }
  modal.querySelector('.close-btn')?.addEventListener('click', closeModal);
}

document.addEventListener('ui:modal-open', (e) => {
  if (e.detail?.id === 'hero-chooser') {
    pauseGroup('gameplay');
    pauseGroup('minigames');
    pauseGroup('background');
  }
});

document.addEventListener('ui:modal-close', (e) => {
  if (e.detail?.id === 'hero-chooser') {
    resumeGroup('background');
    resumeGroup('minigames');
    resumeGroup('gameplay');
  }
});
