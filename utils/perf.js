export function rafThrottle(fn) {
  let running = false;
  let lastArgs = null;
  return (...args) => {
    lastArgs = args;
    if (running) return;
    running = true;
    requestAnimationFrame(() => {
      running = false;
      fn(...lastArgs);
    });
  };
}

export function debounce(fn, ms = 200) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

export function addPassiveListeners(target, events, handler) {
  for (const ev of events) {
    target.addEventListener(ev, handler, { passive: true });
  }
}

export const dom = (() => {
  const reads = [];
  const writes = [];
  function flush() {
    const r = reads.splice(0);
    for (const f of r) f();
    const w = writes.splice(0);
    for (const f of w) f();
  }
  return {
    read(f) {
      reads.push(f);
      requestAnimationFrame(flush);
    },
    write(f) {
      writes.push(f);
      requestAnimationFrame(flush);
    }
  };
})();
