// Wrapper central para categorizar timers y poder pausarlos/reanudarlos
const groups = new Map(); // groupName -> { active: Set, paused: boolean }

function getGroup(g) {
  if (!groups.has(g)) groups.set(g, { active: new Set(), paused: false });
  return groups.get(g);
}

export function setIntervalG(fn, ms, group = 'gameplay') {
  const grp = getGroup(group);
  const h = { kind: 'interval', ms, fn, id: null, group };
  const runner = () => fn();
  h.id = window.setInterval(runner, ms);
  grp.active.add(h);
  return h;
}

export function clearIntervalG(h) {
  if (!h || h.kind !== 'interval') return;
  window.clearInterval(h.id);
  const grp = getGroup(h.group);
  grp.active.delete(h);
}

export function rafG(fn, group = 'gameplay') {
  const grp = getGroup(group);
  const h = { kind: 'raf', fn, id: null, group, running: true };
  const loop = (ts) => {
    if (!h.running || grp.paused) return;
    fn(ts);
    h.id = requestAnimationFrame(loop);
  };
  h.id = requestAnimationFrame(loop);
  grp.active.add(h);
  return h;
}

export function cancelRafG(h) {
  if (!h || h.kind !== 'raf') return;
  h.running = false;
  cancelAnimationFrame(h.id);
  const grp = getGroup(h.group);
  grp.active.delete(h);
}

export function pauseGroup(group = 'gameplay') {
  const grp = getGroup(group);
  grp.paused = true;
  for (const h of grp.active) {
    if (h.kind === 'interval') {
      clearInterval(h.id);
      h._paused = true;
    }
    if (h.kind === 'raf') {
      h.running = false;
      cancelAnimationFrame(h.id);
    }
  }
}

export function resumeGroup(group = 'gameplay') {
  const grp = getGroup(group);
  if (!grp.paused) return;
  grp.paused = false;
  for (const h of grp.active) {
    if (h.kind === 'interval' && h._paused) {
      h.id = setInterval(h.fn, h.ms);
      h._paused = false;
    }
    if (h.kind === 'raf') {
      h.running = true;
      h.id = requestAnimationFrame(function loop(ts) {
        if (!h.running || grp.paused) return;
        h.fn(ts);
        h.id = requestAnimationFrame(loop);
      });
    }
  }
}
