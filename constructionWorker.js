const tasks = new Map();
const taskOrder = [];
let cursor = 0;

self.onmessage = e => {
  const { idConstruccion, tiempoRestante, tipo } = e.data;
  if (tiempoRestante <= 0) {
    tasks.delete(idConstruccion);
    const idx = taskOrder.indexOf(idConstruccion);
    if (idx !== -1) taskOrder.splice(idx, 1);
    return;
  }
  if (!tasks.has(idConstruccion)) taskOrder.push(idConstruccion);
  tasks.set(idConstruccion, { end: Date.now() + tiempoRestante * 1000, tipo });
};

function tick() {
  const now = Date.now();
  const updates = [];
  if (tasks.size <= 5) {
    tasks.forEach((task, id) => {
      const remaining = Math.max(0, Math.ceil((task.end - now) / 1000));
      if (remaining <= 0) {
        updates.push({ idConstruccion: id, tipo: task.tipo, tiempoRestante: 0, done: true });
        tasks.delete(id);
        const idx = taskOrder.indexOf(id);
        if (idx !== -1) taskOrder.splice(idx, 1);
      } else {
        updates.push({ idConstruccion: id, tipo: task.tipo, tiempoRestante: remaining });
      }
    });
  } else {
    let processed = 0;
    while (processed < 3 && taskOrder.length > 0) {
      if (cursor >= taskOrder.length) cursor = 0;
      const id = taskOrder[cursor];
      const task = tasks.get(id);
      if (!task) {
        taskOrder.splice(cursor, 1);
        continue;
      }
      const remaining = Math.max(0, Math.ceil((task.end - now) / 1000));
      if (remaining <= 0) {
        updates.push({ idConstruccion: id, tipo: task.tipo, tiempoRestante: 0, done: true });
        tasks.delete(id);
        taskOrder.splice(cursor, 1);
      } else {
        updates.push({ idConstruccion: id, tipo: task.tipo, tiempoRestante: remaining });
        cursor++;
      }
      processed++;
    }
  }
  if (updates.length) self.postMessage({ batch: updates });
  setTimeout(tick, 60000); // Cambiar a 1 minuto para optimización
}

tick();
