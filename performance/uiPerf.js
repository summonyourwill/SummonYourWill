import { addPassiveListeners } from '../utils/perf.js';

export const UI_PERF_FLAG = true;

const isProd = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

export const uiPerfMetrics = {
  interactionSamples: [],
  interactionAvg: 0,
  droppedFrames: 0,
};

let interactionPending = false;
function onInteractionStart() {
  if (interactionPending) return;
  interactionPending = true;
  performance.mark('ui:interaction:start');
  requestAnimationFrame(() => {
    performance.mark('ui:interaction:end');
    const name = 'ui:interaction';
    performance.measure(name, 'ui:interaction:start', 'ui:interaction:end');
    const entries = performance.getEntriesByName(name);
    const duration = entries[entries.length - 1]?.duration || 0;
    const samples = uiPerfMetrics.interactionSamples;
    samples.push(duration);
    if (samples.length > 20) samples.shift();
    uiPerfMetrics.interactionAvg = samples.reduce((a, b) => a + b, 0) / samples.length;
    //if (!isProd) console.log('interaction', duration.toFixed(2), 'ms');
    performance.clearMarks('ui:interaction:start');
    performance.clearMarks('ui:interaction:end');
    performance.clearMeasures(name);
    interactionPending = false;
  });
}

let scrolling = false;
let scrollTimer = 0;
let frameHandle = 0;
let lastFrame = 0;
function frameLoop(time) {
  if (!scrolling) {
    frameHandle = 0;
    lastFrame = 0;
    return;
  }
  if (lastFrame) {
    const delta = time - lastFrame;
    uiPerfMetrics.droppedFrames += Math.max(0, Math.round(delta / 16.67) - 1);
  }
  lastFrame = time;
  frameHandle = requestAnimationFrame(frameLoop);
}
function onScroll() {
  onInteractionStart();
  scrolling = true;
  if (!frameHandle) frameHandle = requestAnimationFrame(frameLoop);
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => { scrolling = false; }, 120);
}

export function initUIPerf() {
  if (!UI_PERF_FLAG) return;
  const noop = () => {};
  addPassiveListeners(window, ['wheel', 'touchstart', 'touchmove'], noop);
  window.addEventListener('pointerdown', onInteractionStart, { passive: true });
  window.addEventListener('input', onInteractionStart, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
}
