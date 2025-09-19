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
      promise = import('howler');
    } else {
      const url = new URL('../../lib/howler.min.js', import.meta.url);
      promise = loadScript(url.href);
    }
  }
  return promise;
}

/**
 * Dynamically load the Howler library and return the global Howler object.
 * Works in both Node and browser environments.
 *
 * @returns {Promise<typeof import('howler').Howler>}
 */
export async function getHowler() {
  const mod = await load();
  return mod.Howler || mod.default && mod.default.Howler;
}

/**
 * Dynamically load the Howler library and return the Howl constructor.
 *
 * @returns {Promise<typeof import('howler').Howl>}
 */
export async function getHowl() {
  const mod = await load();
  return mod.Howl || mod.default && mod.default.Howl;
}
