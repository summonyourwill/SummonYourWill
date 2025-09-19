// Attempt to use electron-store when running inside Electron. If the module
// isn't available (e.g. the HTML file is opened directly in a browser), fall
// back to localStorage so the app remains usable.
let store = window.electronStore;

if (!store) {
  try {
    // When nodeIntegration is enabled, `window.require` is available in the
    // renderer process. Using it avoids parse errors in browsers that don't
    // understand the `electron-store` module specifier.
    const Store = window.require ? window.require('electron-store') : null;
    if (Store) {
      // Provide a project name so electron-store works even when the Electron
      // `app` instance isn't yet ready.
      store = new Store({ projectName: 'summonyourwill' });
    }
  } catch (err) {
    // Ignore and fall back to localStorage.
  }
}

if (!store) {
  store = {
    get(key) {
      const raw = localStorage.getItem(key);
      try {
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    delete(key) {
      localStorage.removeItem(key);
    }
  };
}

/**
 * Retrieve a value from storage.
 *
 * @param {string} key Storage key.
 * @returns {any} Stored value or undefined.
 */
export function getItem(key) {
  return store.get(key);
}

/**
 * Persist a value to storage.
 *
 * @param {string} key Storage key.
 * @param {any} value Value to store.
 * @returns {void}
 */
export function setItem(key, value) {
  store.set(key, value);
}

/**
 * Remove an item from storage.
 *
 * @param {string} key Storage key.
 * @returns {void}
 */
export function removeItem(key) {
  store.delete(key);
}

export default store;
