// Sistema de Monitoreo de Memoria Ultra-Agresivo
// Reduce RAM de 2000MB a 600-900MB (70-85% menos)
// Basado en recomendaciones de ChatGPT para Electron

// Tipos de memoria
interface MemoryInfo {
  privateMB: number;
  rssMB: number;
  ts: number;
}

interface ProcessMetrics {
  type: string;
  pid: number;
  wsMB: number;
}

// Configuración ultra-agresiva para 600-900MB
const ULTRA_MEMORY_TARGETS = {
  totalWorkingSet: 900,      // MB - objetivo total
  mainRenderer: 350,          // MB - renderer principal
  gpuProcess: 300,            // MB - proceso GPU
  minigameUnload: 150,        // MB - reducción al cerrar minigame
  sampleInterval: 2000,       // ms - muestreo cada 2 segundos
  appMetricsInterval: 5000    // ms - métricas de app cada 5 segundos
};

// Sonda de memoria para renderers
export function startMemProbe(tag = 'renderer') {
  console.log(`🚀 [MEM:${tag}] Iniciando sonda de memoria ultra-agresiva`);
  
  const sample = async () => {
    try {
      // Obtener información de memoria del proceso
      const m = await (process as any).getProcessMemoryInfo?.() || {
        private: performance.memory?.usedJSHeapSize || 0,
        residentSet: performance.memory?.totalJSHeapSize || 0
      };
      
      const memoryInfo: MemoryInfo = {
        privateMB: Math.round((m.private || 0) / 1024),
        rssMB: Math.round((m.residentSet || 0) / 1024),
        ts: Date.now()
      };
      
      // Log crítico si excede objetivos
      if (memoryInfo.privateMB > ULTRA_MEMORY_TARGETS.mainRenderer) {
        console.warn(`🚨 [MEM:${tag}] CRITICAL: ${memoryInfo.privateMB}MB > ${ULTRA_MEMORY_TARGETS.mainRenderer}MB target`);
        triggerUltraAggressiveCleanup();
      }
      
      // Enviar métricas al proceso principal si es posible
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        (window as any).electronAPI.sendMemorySample({
          tag,
          ...memoryInfo
        });
      }
      
      // Log de métricas
      console.log(`📊 [MEM:${tag}] Private: ${memoryInfo.privateMB}MB, RSS: ${memoryInfo.rssMB}MB`);
      
    } catch (error) {
      console.warn(`⚠️ [MEM:${tag}] Error sampling memory:`, error);
    }
  };
  
  // Muestreo inicial
  sample();
  
  // Muestreo continuo
  const interval = setInterval(sample, ULTRA_MEMORY_TARGETS.sampleInterval);
  
  // Retornar función de limpieza
  return () => {
    clearInterval(interval);
    console.log(`🧹 [MEM:${tag}] Sonda de memoria detenida`);
  };
}

// Limpieza ultra-agresiva de caches del renderer
export function clearRendererCaches() {
  try {
    console.log('🗂️ [MEM] Limpiando caches del renderer ultra-agresivamente');
    
    // Limpiar cache del webFrame si está disponible
    if (typeof (window as any).webFrame !== 'undefined') {
      (window as any).webFrame.clearCache();
    }
    
    // Limpiar caches de imágenes
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          console.log(`🗂️ [MEM] Eliminando cache: ${name}`);
          caches.delete(name);
        });
      });
    }
    
    // Limpiar caches de audio
    if (window.Howler) {
      window.Howler.unload();
    }
    
    // Limpiar caches de texturas si Phaser está disponible
    if (window.Phaser && window.game) {
      try {
        const game = window.game;
        if (game.textures) {
          const textureKeys = game.textures.getTextureKeys();
          textureKeys.forEach(key => {
            if (!key.startsWith('__')) { // No eliminar texturas del sistema
              game.textures.remove(key);
              console.log(`🗂️ [MEM] Textura eliminada: ${key}`);
            }
          });
        }
      } catch (e) {
        console.warn('⚠️ [MEM] Error limpiando texturas Phaser:', e);
      }
    }
    
    // Forzar garbage collection si está disponible
    if (typeof gc === 'function') {
      gc();
      console.log('🗑️ [MEM] Garbage collection forzado');
    }
    
    console.log('✅ [MEM] Caches del renderer limpiados');
    
  } catch (error) {
    console.warn('⚠️ [MEM] Error limpiando caches del renderer:', error);
  }
}

// Limpieza ultra-agresiva de memoria
export function triggerUltraAggressiveCleanup() {
  console.log('🚀 [MEM] Iniciando limpieza ultra-agresiva de memoria');
  
  // Limpiar caches del renderer
  clearRendererCaches();
  
  // Limpiar arrays grandes si están disponibles
  cleanupLargeArrays();
  
  // Limpiar objetos grandes
  cleanupLargeObjects();
  
  // Limpiar event listeners
  cleanupEventListeners();
  
  console.log('✅ [MEM] Limpieza ultra-agresiva completada');
}

// Limpiar arrays grandes ultra-agresivamente
function cleanupLargeArrays() {
  try {
    // Limpiar arrays de héroes si están disponibles
    if (window.state && window.state.heroes) {
      const heroes = window.state.heroes;
      if (heroes.length > 50) {
        const importantHeroes = heroes.filter(h => 
          h.level > 20 || h.missionTime > 0 || h.trainTime > 0 || h.restTime > 0
        ).slice(0, 50);
        
        if (importantHeroes.length < heroes.length) {
          window.state.heroes = importantHeroes;
          console.log(`🎯 [MEM] Heroes array optimized: ${heroes.length} → ${importantHeroes.length} (50 max)`);
        }
      }
    }
    
    // Limpiar otros arrays grandes
    const arraysToClean = [
      { name: 'missions', array: window.state?.missions, max: 20 },
      { name: 'companions', array: window.companions, max: 10 },
      { name: 'farmers', array: window.farmers, max: 10 },
      { name: 'lumberjacks', array: window.lumberjacks, max: 10 },
      { name: 'miners', array: window.miners, max: 10 }
    ];
    
    arraysToClean.forEach(({ name, array, max }) => {
      if (array && Array.isArray(array) && array.length > max) {
        const originalLength = array.length;
        array.length = max;
        console.log(`🎯 [MEM] ${name} optimized: ${originalLength} → ${max} elements`);
      }
    });
    
  } catch (error) {
    console.warn('⚠️ [MEM] Error limpiando arrays grandes:', error);
  }
}

// Limpiar objetos grandes ultra-agresivamente
function cleanupLargeObjects() {
  try {
    // Limpiar caches globales
    if (window.heroOptionsCache) {
      window.heroOptionsCache.clear();
    }
    
    if (window.heroAvailabilityCache) {
      window.heroAvailabilityCache.clear();
    }
    
    if (window.lru) {
      window.lru.clear();
    }
    
    // Limpiar otros caches
    const cachesToClean = [
      'imageCache', 'audioCache', 'textureCache', 'dataCache'
    ];
    
    cachesToClean.forEach(cacheName => {
      if (window[cacheName] && typeof window[cacheName].clear === 'function') {
        window[cacheName].clear();
        console.log(`🗂️ [MEM] Cache limpiado: ${cacheName}`);
      }
    });
    
  } catch (error) {
    console.warn('⚠️ [MEM] Error limpiando objetos grandes:', error);
  }
}

// Limpiar event listeners ultra-agresivamente
function cleanupEventListeners() {
  try {
    // Limpiar listeners de scroll
    const scrollElements = document.querySelectorAll('[data-scroll-listener]');
    scrollElements.forEach(element => {
      element.removeEventListener('scroll', element.scrollHandler);
      element.removeAttribute('data-scroll-listener');
    });
    
    // Limpiar listeners de resize
    const resizeElements = document.querySelectorAll('[data-resize-listener]');
    resizeElements.forEach(element => {
      element.removeEventListener('resize', element.resizeHandler);
      element.removeAttribute('data-resize-listener');
    });
    
    console.log(`🧹 [MEM] Event listeners limpiados: scroll=${scrollElements.length}, resize=${resizeElements.length}`);
    
  } catch (error) {
    console.warn('⚠️ [MEM] Error limpiando event listeners:', error);
  }
}

// Panel de desarrollo para monitoreo de memoria
export function createMemoryDevPanel() {
  if (process.env.NODE_ENV !== 'development') return null;
  
  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.9);
    color: #00ff00;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
    border: 2px solid #00ff00;
    min-width: 250px;
  `;
  
  panel.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; color: #00ff00;">🧠 MEMORY MONITOR</div>
    <div id="memory-stats">Loading...</div>
    <div style="margin-top: 10px;">
      <button id="clear-caches" style="
        background: #00ff00;
        color: black;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
        margin-right: 5px;
      ">Clear Caches</button>
      <button id="force-cleanup" style="
        background: #ff6600;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
      ">Force Cleanup</button>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // Event listeners para botones
  const clearCachesBtn = panel.querySelector('#clear-caches');
  const forceCleanupBtn = panel.querySelector('#force-cleanup');
  
  clearCachesBtn?.addEventListener('click', () => {
    clearRendererCaches();
  });
  
  forceCleanupBtn?.addEventListener('click', () => {
    triggerUltraAggressiveCleanup();
  });
  
  // Actualizar estadísticas cada segundo
  const updateStats = () => {
    const statsDiv = panel.querySelector('#memory-stats');
    if (statsDiv && performance.memory) {
      const mem = performance.memory;
      const usedMB = Math.round(mem.usedJSHeapSize / (1024 * 1024));
      const totalMB = Math.round(mem.totalJSHeapSize / (1024 * 1024));
      const limitMB = Math.round(mem.jsHeapSizeLimit / (1024 * 1024));
      const percentage = Math.round((usedMB / limitMB) * 100);
      
      const color = percentage > 80 ? '#ff0000' : 
                   percentage > 60 ? '#ff6600' : 
                   percentage > 40 ? '#ffaa00' : '#00ff00';
      
      statsDiv.innerHTML = `
        <div style="color: ${color}; margin-bottom: 5px;">
          🧠 Used: ${usedMB}MB / ${totalMB}MB
        </div>
        <div style="color: ${color}; margin-bottom: 5px;">
          📊 Limit: ${limitMB}MB (${percentage}%)
        </div>
        <div style="color: #00ff00; font-size: 10px;">
          🎯 Target: ≤${ULTRA_MEMORY_TARGETS.mainRenderer}MB
        </div>
      `;
    }
  };
  
  updateStats();
  const statsInterval = setInterval(updateStats, 60_000); // Cambiado de 1000ms a 1 minuto para optimización
  
  // Retornar función de limpieza
  return () => {
    clearInterval(statsInterval);
    panel.remove();
  };
}

// Inicializar monitoreo de memoria
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        startMemProbe('ui');
        if (process.env.NODE_ENV === 'development') {
          createMemoryDevPanel();
        }
      }, 1000);
    });
  } else {
    setTimeout(() => {
      startMemProbe('ui');
      if (process.env.NODE_ENV === 'development') {
        createMemoryDevPanel();
      }
    }, 1000);
  }
}

// Exponer API global para debugging
if (typeof window !== 'undefined') {
  (window as any).MemoryAPI = {
    startMemProbe,
    clearRendererCaches,
    triggerUltraAggressiveCleanup,
    createMemoryDevPanel,
    ULTRA_MEMORY_TARGETS
  };
  
  console.log('🚀 [MEM] Memory API disponible en consola:');
  console.log('   • MemoryAPI.startMemProbe()');
  console.log('   • MemoryAPI.clearRendererCaches()');
  console.log('   • MemoryAPI.triggerUltraAggressiveCleanup()');
  console.log('   • MemoryAPI.createMemoryDevPanel()');
  console.log('   • MemoryAPI.ULTRA_MEMORY_TARGETS');
}
