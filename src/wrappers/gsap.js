let promise;
function load() {
  if (!promise) {
    if (typeof window === 'undefined') {
      promise = import('gsap');
    } else {
      promise = import('https://cdn.skypack.dev/gsap');
    }
  }
  return promise;
}
export async function getGsap() {
  const mod = await load();
  return mod.default || mod.gsap || mod;
}
