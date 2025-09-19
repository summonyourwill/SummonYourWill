export default class QuickLRU extends Map {
  constructor({ maxSize = 100 } = {}) {
    super();
    this.maxSize = maxSize;
  }

  get(key) {
    if (!super.has(key)) {
      return undefined;
    }
    const value = super.get(key);
    super.delete(key);
    super.set(key, value);
    return value;
  }

  set(key, value) {
    if (super.has(key)) {
      super.delete(key);
    }
    super.set(key, value);
    this._trim();
    return this;
  }

  _trim() {
    while (this.size > this.maxSize) {
      const oldestKey = this.keys().next().value;
      super.delete(oldestKey);
    }
  }
}
