let promise;
function load() {
  if (!promise) {
    if (typeof window === 'undefined') {
      promise = import('pixi.js');
    } else {
      promise = import('https://cdn.skypack.dev/pixi.js');
    }
  }
  return promise;
}
export async function getPixi() {
  return load();
}
