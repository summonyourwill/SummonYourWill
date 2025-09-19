let promise;
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(window);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
function load() {
  if (!promise) {
    if (typeof window === 'undefined') {
      promise = import('stats.js');
    } else {
      promise = loadScript('./lib/stats.min.js');
    }
  }
  return promise;
}
export async function getStats() {
  const mod = await load();
  return mod.Stats || mod.default || mod;
}
