/**
 * Create a simple object pool used to recycle frequently allocated objects.
 *
 * @template T
 * @param {() => T} factory Function that creates a new object instance.
 * @param {number} [size=32] Initial pool size.
 * @returns {{acquire: () => T, release: (obj:T) => void}} Pool interface.
 */
export function createPool(factory, size = 32) {
  const pool = [];
  for (let i = 0; i < size; i++) pool.push(factory());
  return {
    acquire() {
      return pool.length ? pool.pop() : factory();
    },
    release(obj) {
      pool.push(obj);
    }
  };
}
