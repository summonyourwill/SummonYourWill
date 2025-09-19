// perf.js — producción (stub seguro, no rompe si se carga como <script> clásico o módulo)
(function (global) {
  try {
    if (!global.__SYW_PERF__) {
      global.__SYW_PERF__ = {
        mark: function(){},
        measure: function(){},
        log: function(){},
      };
    }
  } catch (e) {
    // no-op
  }
})(typeof window !== 'undefined' ? window : globalThis);
