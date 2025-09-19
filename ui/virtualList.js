export function createVirtualList({ container, rowHeight = 56, overscan = 6, renderRow }) {
  const state = { data: [], top: 0, height: 0, start: 0, end: 0, nodes: [] };
  container.style.position = 'relative';
  container.style.overflow = 'auto';

  const spacer = document.createElement('div');
  spacer.style.width = '1px';
  spacer.style.height = '0px';
  container.appendChild(spacer);

  function ensurePool(poolSize = overscan * 2 + 30) {
    while (state.nodes.length < poolSize) {
      const n = document.createElement('div');
      n.style.position = 'absolute';
      n.style.left = '0';
      n.style.right = '0';
      n.style.height = rowHeight + 'px';
      container.appendChild(n);
      state.nodes.push(n);
    }
  }

  function layout() {
    state.height = container.clientHeight;
    const visible = Math.ceil(state.height / rowHeight);
    state.start = Math.max(0, Math.floor(container.scrollTop / rowHeight) - overscan);
    state.end = Math.min(state.data.length, state.start + visible + overscan * 2);
    const poolSize = state.end - state.start;
    ensurePool(poolSize);

    for (let i = 0; i < poolSize; i++) {
      const item = state.data[state.start + i];
      const node = state.nodes[i];
      node.style.transform = `translateY(${(state.start + i) * rowHeight}px)`;
      renderRow(node, item, state.start + i);
    }
    spacer.style.height = state.data.length * rowHeight + 'px';
  }

  const onScroll = () => requestAnimationFrame(layout);
  const ro = new ResizeObserver(() => layout());
  container.addEventListener('scroll', onScroll, { passive: true });
  ro.observe(container);

  return {
    setData(list) {
      state.data = list || [];
      layout();
    },
    refresh() {
      layout();
    },
    destroy() {
      container.removeEventListener('scroll', onScroll);
      ro.disconnect();
      state.nodes.forEach((n) => n.remove());
      spacer.remove();
    },
  };
}
