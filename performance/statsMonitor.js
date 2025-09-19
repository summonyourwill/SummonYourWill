import { getStats } from '../src/wrappers/stats.js';

let stats;
let wrapper;
let plusBtn;
let minusBtn;
let frameId = null;
let hiddenByUser = false;
let placeFn = null;
let debugTimer = 0;

function loop() {
  stats.begin();
  stats.end();
  frameId = requestAnimationFrame(loop);
}

function startLoop() {
  if (!frameId) frameId = requestAnimationFrame(loop);
}

export function start() {
  if (!wrapper || hiddenByUser) return;
  wrapper.style.display = 'flex';
  stats.domElement.style.display = 'flex';
  minusBtn.style.display = 'block';
  plusBtn.style.display = 'none';
  startLoop();
}

export function stop() {
  if (frameId) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  if (stats) stats.end();
}

export function show() {
  hiddenByUser = false;
  localStorage.setItem('statsHidden', 'false');
  start();
}

export function hide() {
  hiddenByUser = true;
  localStorage.setItem('statsHidden', 'true');
  stop();
  if (wrapper) {
    stats.domElement.style.display = 'none';
    wrapper.style.display = 'flex';
    minusBtn.style.display = 'none';
    plusBtn.style.display = 'block';
  }
}

export async function initStatsMonitor() {
  if (wrapper) return;
  hiddenByUser = JSON.parse(localStorage.getItem('statsHidden') || 'false');
  const Stats = await getStats();
  stats = new Stats();
  stats.showPanel(0);
  const el = stats.domElement;
  el.style.display = 'flex';
  el.style.gap = '4px';
  el.style.background = 'rgba(0,0,0,0.6)';
  el.style.borderRadius = '4px';
  el.style.pointerEvents = 'auto';
  el.style.cursor = 'default';
  el.style.padding = '2px';
  [...el.children].forEach(c => {
    c.style.display = 'block';
    c.style.pointerEvents = 'none';
  });
  ['click', 'mousedown', 'touchstart'].forEach(ev => {
    el.addEventListener(ev, e => {
      e.stopPropagation();
      e.preventDefault();
    }, true);
  });

  wrapper = document.createElement('div');
  wrapper.id = 'perfHUD';
  wrapper.style.position = 'fixed';
  wrapper.style.zIndex = '10000';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'flex-start';
  wrapper.style.gap = '4px';
  wrapper.style.pointerEvents = 'auto';
  wrapper.style.top = '10px';
  wrapper.style.right = '10px';
  wrapper.style.left = 'auto';

  minusBtn = document.createElement('button');
  minusBtn.textContent = '−';
  styleBtn(minusBtn);
  minusBtn.onclick = hide;

  plusBtn = document.createElement('button');
  plusBtn.textContent = '+';
  styleBtn(plusBtn);
  plusBtn.onclick = show;

  wrapper.appendChild(el);
  wrapper.appendChild(minusBtn);
  wrapper.appendChild(plusBtn);
  document.body.appendChild(wrapper);

  function place() {
    if (!wrapper) return;
    wrapper.style.top = '10px';
    wrapper.style.right = '10px';
    wrapper.style.left = 'auto';
  }
  placeFn = place;
  window.addEventListener('resize', place);
  place();

  if (hiddenByUser) {
    hide();
  } else {
    plusBtn.style.display = 'none';
    start();
  }
}

function styleBtn(btn) {
  btn.style.position = 'relative';
  btn.style.background = 'rgba(0,0,0,0.8)';
  btn.style.marginLeft = '4px';
  btn.style.border = 'none';
  btn.style.color = '#fff';
  btn.style.cursor = 'pointer';
  btn.style.width = '20px';
  btn.style.height = '20px';
  btn.style.fontSize = '14px';
  btn.style.lineHeight = '20px';
  btn.style.padding = '0';
}

export function wireVisibility(electronAPI) {
  const handler = hidden => {
    if (hidden) {
      stop();
    } else if (hiddenByUser) {
      hide();
    } else {
      start();
    }
  };
  document.addEventListener('visibilitychange', () => handler(document.hidden));
  if (electronAPI && electronAPI.on) {
    electronAPI.on('app-visibility', (_e, data) => handler(data.hidden));
  }
}

export function reposition() {
  if (placeFn) placeFn();
}

export async function runDebug(duration = 5000) {
  await initStatsMonitor();
  hiddenByUser = false;
  localStorage.setItem('statsHidden', 'false');
  stats.domElement.style.display = 'flex';
  minusBtn.style.display = 'block';
  plusBtn.style.display = 'none';
  if (frameId) cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(loop);
  clearTimeout(debugTimer);
  debugTimer = setTimeout(hide, duration);
}
