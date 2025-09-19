let promise;
function load() {
  if (!promise) {
    if (typeof window === 'undefined') {
      promise = import('bitecs');
    } else {
      promise = import('https://cdn.skypack.dev/bitecs');
    }
  }
  return promise;
}
export async function getBitecs() {
  return load();
}
