// Gestor de Assets Ultra-Agresivo
// Libera memoria de imágenes, texturas y audio para reducir RAM de 2000MB a 600-900MB
// Basado en recomendaciones de ChatGPT para Electron

// Configuración ultra-agresiva de assets
const ULTRA_ASSET_CONFIG = {
  maxTextureSize: 2048,       // Máximo 2048x2048 (no 4096x4096)
  maxAudioTracks: 3,          // Máximo 3 tracks de audio simultáneos
  maxImageCache: 20,          // Máximo 20 imágenes en cache
  maxTextureCache: 15,        // Máximo 15 texturas en cache
  maxAudioCache: 10,          // Máximo 10 archivos de audio en cache
  cleanupInterval: 10000,     // ms - limpiar assets cada 10 segundos
  maxAssetAge: 60000,         // ms - assets expiran después de 1 minuto
  forceCleanupThreshold: 800  // MB - forzar limpieza si memoria > 800MB
};

// Tipos de assets
interface AssetInfo {
  key: string;
  type: 'image' | 'texture' | 'audio' | 'texture-atlas';
  size: number; // bytes
  lastUsed: number;
  loaded: boolean;
  url?: string;
  element?: HTMLImageElement | HTMLAudioElement;
  texture?: any; // Phaser texture
}

// Gestor de assets ultra-agresivo
export class UltraAssetManager {
  private assets: Map<string, AssetInfo> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private totalMemoryUsage: number = 0;
  private sceneAssets: Map<string, Set<string>> = new Map();
  private currentScene: string = 'main';
  
  constructor() {
    this.startAssetCleanup();
    console.log('🚀 [ASSET] Ultra Asset Manager initialized');
  }
  
  /**
   * Registra un asset
   */
  registerAsset(key: string, type: AssetInfo['type'], size: number, url?: string): void {
    const asset: AssetInfo = {
      key,
      type,
      size,
      lastUsed: Date.now(),
      loaded: false,
      url
    };
    
    this.assets.set(key, asset);
    this.totalMemoryUsage += size;
    
    console.log(`📁 [ASSET] Registered ${type}: ${key} (${this.formatBytes(size)})`);
    
    // Verificar límites de memoria
    this.checkMemoryLimits();
  }
  
  /**
   * Marca un asset como cargado
   */
  markAssetLoaded(key: string, element?: HTMLImageElement | HTMLAudioElement, texture?: any): void {
    const asset = this.assets.get(key);
    if (asset) {
      asset.loaded = true;
      asset.element = element;
      asset.texture = texture;
      asset.lastUsed = Date.now();
      
      console.log(`✅ [ASSET] Asset loaded: ${key}`);
    }
  }
  
  /**
   * Usa un asset (actualiza timestamp de uso)
   */
  useAsset(key: string): void {
    const asset = this.assets.get(key);
    if (asset) {
      asset.lastUsed = Date.now();
    }
  }
  
  /**
   * Registra assets de una escena
   */
  registerSceneAssets(sceneName: string, assetKeys: string[]): void {
    if (!this.sceneAssets.has(sceneName)) {
      this.sceneAssets.set(sceneName, new Set());
    }
    
    const sceneAssetSet = this.sceneAssets.get(sceneName)!;
    assetKeys.forEach(key => sceneAssetSet.add(key));
    
    console.log(`🎬 [ASSET] Scene ${sceneName} registered ${assetKeys.length} assets`);
  }
  
  /**
   * Cambia a una escena específica
   */
  switchScene(sceneName: string): void {
    if (this.currentScene === sceneName) return;
    
    console.log(`🔄 [ASSET] Switching scene: ${this.currentScene} → ${sceneName}`);
    
    // Limpiar assets de la escena anterior
    this.cleanupSceneAssets(this.currentScene);
    
    // Cambiar escena actual
    this.currentScene = sceneName;
    
    // Precargar assets de la nueva escena
    this.preloadSceneAssets(sceneName);
  }
  
  /**
   * Limpia assets de una escena específica
   */
  private cleanupSceneAssets(sceneName: string): void {
    const sceneAssets = this.sceneAssets.get(sceneName);
    if (!sceneAssets) return;
    
    console.log(`🧹 [ASSET] Cleaning up assets for scene: ${sceneName}`);
    
    for (const assetKey of sceneAssets) {
      this.unloadAsset(assetKey);
    }
    
    // Limpiar registro de la escena
    this.sceneAssets.delete(sceneName);
    
    console.log(`✅ [ASSET] Scene ${sceneName} assets cleaned up`);
  }
  
  /**
   * Precarga assets de una escena
   */
  private preloadSceneAssets(sceneName: string): void {
    const sceneAssets = this.sceneAssets.get(sceneName);
    if (!sceneAssets) return;
    
    console.log(`📥 [ASSET] Preloading assets for scene: ${sceneName}`);
    
    // Aquí podrías implementar precarga inteligente
    // Por ahora solo registramos que los assets están disponibles
    for (const assetKey of sceneAssets) {
      const asset = this.assets.get(assetKey);
      if (asset) {
        asset.lastUsed = Date.now();
      }
    }
  }
  
  /**
   * Descarga un asset específico
   */
  unloadAsset(key: string): void {
    const asset = this.assets.get(key);
    if (!asset) return;
    
    try {
      console.log(`🗑️ [ASSET] Unloading asset: ${key}`);
      
      // Limpiar elemento DOM
      if (asset.element) {
        if (asset.element instanceof HTMLImageElement) {
          asset.element.src = '';
          asset.element.remove();
        } else if (asset.element instanceof HTMLAudioElement) {
          asset.element.pause();
          asset.element.src = '';
          asset.element.remove();
        }
        asset.element = undefined;
      }
      
      // Limpiar textura Phaser si existe
      if (asset.texture && window.game && window.game.textures) {
        try {
          window.game.textures.remove(key);
          console.log(`🎨 [ASSET] Phaser texture removed: ${key}`);
        } catch (e) {
          console.warn(`⚠️ [ASSET] Error removing Phaser texture ${key}:`, e);
        }
        asset.texture = undefined;
      }
      
      // Limpiar URL de objeto si existe
      if (asset.url && asset.url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(asset.url);
          console.log(`🔗 [ASSET] Blob URL revoked: ${key}`);
        } catch (e) {
          console.warn(`⚠️ [ASSET] Error revoking blob URL for ${key}:`, e);
        }
      }
      
      // Actualizar uso de memoria
      this.totalMemoryUsage -= asset.size;
      
      // Marcar como no cargado
      asset.loaded = false;
      
      console.log(`✅ [ASSET] Asset unloaded: ${key}`);
      
    } catch (error) {
      console.error(`❌ [ASSET] Error unloading asset ${key}:`, error);
    }
  }
  
  /**
   * Limpieza ultra-agresiva de assets
   */
  private aggressiveAssetCleanup(): void {
    console.log('🚀 [ASSET] Performing aggressive asset cleanup');
    
    // Ordenar assets por último uso (más antiguos primero)
    const sortedAssets = Array.from(this.assets.values())
      .sort((a, b) => a.lastUsed - b.lastUsed);
    
    // Mantener solo assets esenciales de la escena actual
    const currentSceneAssets = this.sceneAssets.get(this.currentScene) || new Set();
    const essentialAssets = sortedAssets.filter(asset => 
      currentSceneAssets.has(asset.key) && 
      asset.loaded
    );
    
    // Limpiar assets no esenciales
    const assetsToRemove = sortedAssets.filter(asset => 
      !essentialAssets.includes(asset)
    );
    
    assetsToRemove.forEach(asset => {
      this.unloadAsset(asset.key);
      this.assets.delete(asset.key);
    });
    
    console.log(`🧹 [ASSET] Aggressive cleanup: ${assetsToRemove.length} assets removed`);
    
    // Forzar garbage collection
    if (typeof gc === 'function') {
      gc();
      console.log('🗑️ [ASSET] Garbage collection forzado');
    }
  }
  
  /**
   * Verifica límites de memoria
   */
  private checkMemoryLimits(): void {
    const memoryMB = this.totalMemoryUsage / (1024 * 1024);
    
    if (memoryMB > ULTRA_ASSET_CONFIG.forceCleanupThreshold) {
      console.warn(`⚠️ [ASSET] Memory usage high: ${memoryMB.toFixed(1)}MB > ${ULTRA_ASSET_CONFIG.forceCleanupThreshold}MB`);
      this.aggressiveAssetCleanup();
    }
    
    // Verificar límites por tipo
    this.checkTypeLimits();
  }
  
  /**
   * Verifica límites por tipo de asset
   */
  private checkTypeLimits(): void {
    const typeCounts = new Map<string, number>();
    
    for (const asset of this.assets.values()) {
      typeCounts.set(asset.type, (typeCounts.get(asset.type) || 0) + 1);
    }
    
    // Verificar límites
    if (typeCounts.get('image') > ULTRA_ASSET_CONFIG.maxImageCache) {
      this.cleanupOldestAssets('image', ULTRA_ASSET_CONFIG.maxImageCache);
    }
    
    if (typeCounts.get('texture') > ULTRA_ASSET_CONFIG.maxTextureCache) {
      this.cleanupOldestAssets('texture', ULTRA_ASSET_CONFIG.maxTextureCache);
    }
    
    if (typeCounts.get('audio') > ULTRA_ASSET_CONFIG.maxAudioCache) {
      this.cleanupOldestAssets('audio', ULTRA_ASSET_CONFIG.maxAudioCache);
    }
  }
  
  /**
   * Limpia los assets más antiguos de un tipo específico
   */
  private cleanupOldestAssets(type: string, maxCount: number): void {
    const typeAssets = Array.from(this.assets.values())
      .filter(asset => asset.type === type)
      .sort((a, b) => a.lastUsed - b.lastUsed);
    
    const assetsToRemove = typeAssets.slice(0, typeAssets.length - maxCount);
    
    assetsToRemove.forEach(asset => {
      this.unloadAsset(asset.key);
      this.assets.delete(asset.key);
    });
    
    if (assetsToRemove.length > 0) {
      console.log(`🧹 [ASSET] Cleaned up ${assetsToRemove.length} old ${type} assets`);
    }
  }
  
  /**
   * Inicia limpieza automática de assets
   */
  private startAssetCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.performAssetCleanup();
    }, ULTRA_ASSET_CONFIG.cleanupInterval);
  }
  
  /**
   * Realiza limpieza de assets
   */
  private performAssetCleanup(): void {
    const now = Date.now();
    const assetsToRemove: string[] = [];
    
    // Identificar assets expirados
    for (const [key, asset] of this.assets.entries()) {
      if (now - asset.lastUsed > ULTRA_ASSET_CONFIG.maxAssetAge) {
        assetsToRemove.push(key);
      }
    }
    
    // Remover assets expirados
    assetsToRemove.forEach(key => {
      this.unloadAsset(key);
      this.assets.delete(key);
    });
    
    if (assetsToRemove.length > 0) {
      console.log(`🧹 [ASSET] Cleaned up ${assetsToRemove.length} expired assets`);
    }
    
    // Verificar límites de memoria
    this.checkMemoryLimits();
  }
  
  /**
   * Formatea bytes a formato legible
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Obtiene estadísticas de assets
   */
  getStats() {
    const typeCounts = new Map<string, number>();
    const loadedCount = Array.from(this.assets.values()).filter(a => a.loaded).length;
    
    for (const asset of this.assets.values()) {
      typeCounts.set(asset.type, (typeCounts.get(asset.type) || 0) + 1);
    }
    
    return {
      totalAssets: this.assets.size,
      loadedAssets: loadedCount,
      totalMemory: this.formatBytes(this.totalMemoryUsage),
      memoryMB: this.totalMemoryUsage / (1024 * 1024),
      currentScene: this.currentScene,
      scenes: this.sceneAssets.size,
      typeCounts: Object.fromEntries(typeCounts),
      limits: ULTRA_ASSET_CONFIG
    };
  }
  
  /**
   * Limpia todos los recursos
   */
  cleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    // Limpiar todos los assets
    for (const [key] of this.assets.entries()) {
      this.unloadAsset(key);
    }
    
    this.assets.clear();
    this.sceneAssets.clear();
    this.totalMemoryUsage = 0;
    
    console.log('🧹 [ASSET] All resources cleaned up');
  }
}

// Gestor de texturas ultra-agresivo para Phaser
export class UltraTextureManager {
  private game: any;
  private textureRegistry: Map<string, { key: string; size: number; lastUsed: number }> = new Map();
  
  constructor(game: any) {
    this.game = game;
    console.log('🎨 [TEXTURE] Ultra Texture Manager initialized');
  }
  
  /**
   * Carga una textura con límites ultra-agresivos
   */
  loadTexture(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Verificar límites de texturas
        if (this.textureRegistry.size >= ULTRA_ASSET_CONFIG.maxTextureCache) {
          this.cleanupOldestTextures();
        }
        
        // Cargar textura
        this.game.load.image(key, url);
        
        this.game.load.once('complete', () => {
          // Registrar textura
          this.textureRegistry.set(key, {
            key,
            size: this.estimateTextureSize(key),
            lastUsed: Date.now()
          });
          
          console.log(`🎨 [TEXTURE] Texture loaded: ${key}`);
          resolve();
        });
        
        this.game.load.once('loaderror', (file: any) => {
          console.error(`❌ [TEXTURE] Error loading texture ${key}:`, file);
          reject(new Error(`Failed to load texture: ${key}`));
        });
        
        this.game.load.start();
        
      } catch (error) {
        console.error(`❌ [TEXTURE] Error in loadTexture for ${key}:`, error);
        reject(error);
      }
    });
  }
  
  /**
   * Usa una textura (actualiza timestamp)
   */
  useTexture(key: string): void {
    const texture = this.textureRegistry.get(key);
    if (texture) {
      texture.lastUsed = Date.now();
    }
  }
  
  /**
   * Limpia texturas antiguas
   */
  private cleanupOldestTextures(): void {
    const sortedTextures = Array.from(this.textureRegistry.values())
      .sort((a, b) => a.lastUsed - b.lastUsed);
    
    const texturesToRemove = sortedTextures.slice(0, 
      this.textureRegistry.size - ULTRA_ASSET_CONFIG.maxTextureCache + 1
    );
    
    texturesToRemove.forEach(texture => {
      try {
        this.game.textures.remove(texture.key);
        this.textureRegistry.delete(texture.key);
        console.log(`🧹 [TEXTURE] Removed old texture: ${texture.key}`);
      } catch (e) {
        console.warn(`⚠️ [TEXTURE] Error removing texture ${texture.key}:`, e);
      }
    });
  }
  
  /**
   * Estima el tamaño de una textura
   */
  private estimateTextureSize(key: string): number {
    try {
      const texture = this.game.textures.get(key);
      if (texture && texture.source) {
        const width = texture.source.width || 256;
        const height = texture.source.height || 256;
        return width * height * 4; // 4 bytes por pixel (RGBA)
      }
    } catch (e) {
      // Ignorar errores
    }
    return 256 * 256 * 4; // Estimación por defecto
  }
  
  /**
   * Limpia recursos
   */
  cleanup(): void {
    this.textureRegistry.clear();
    console.log('🧹 [TEXTURE] Texture manager cleaned up');
  }
}

// Gestor de audio ultra-agresivo
export class UltraAudioManager {
  private audioRegistry: Map<string, { key: string; size: number; lastUsed: number; element?: HTMLAudioElement }> = new Map();
  private activeTracks: Set<string> = new Set();
  
  constructor() {
    console.log('🎵 [AUDIO] Ultra Audio Manager initialized');
  }
  
  /**
   * Carga un archivo de audio con límites ultra-agresivos
   */
  loadAudio(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Verificar límites de audio
        if (this.audioRegistry.size >= ULTRA_ASSET_CONFIG.maxAudioCache) {
          this.cleanupOldestAudio();
        }
        
        // Crear elemento de audio
        const audio = new Audio();
        audio.preload = 'none'; // No precargar para ahorrar memoria
        
        audio.addEventListener('canplaythrough', () => {
          // Registrar audio
          this.audioRegistry.set(key, {
            key,
            size: this.estimateAudioSize(url),
            lastUsed: Date.now(),
            element: audio
          });
          
          console.log(`🎵 [AUDIO] Audio loaded: ${key}`);
          resolve();
        });
        
        audio.addEventListener('error', (e) => {
          console.error(`❌ [AUDIO] Error loading audio ${key}:`, e);
          reject(new Error(`Failed to load audio: ${key}`));
        });
        
        audio.src = url;
        
      } catch (error) {
        console.error(`❌ [AUDIO] Error in loadAudio for ${key}:`, error);
        reject(error);
      }
    });
  }
  
  /**
   * Reproduce audio con límites de tracks simultáneos
   */
  playAudio(key: string): boolean {
    const audio = this.audioRegistry.get(key);
    if (!audio || !audio.element) return false;
    
    // Verificar límite de tracks simultáneos
    if (this.activeTracks.size >= ULTRA_ASSET_CONFIG.maxAudioTracks) {
      this.stopOldestTrack();
    }
    
    try {
      audio.element.currentTime = 0;
      audio.element.play();
      
      this.activeTracks.add(key);
      audio.lastUsed = Date.now();
      
      // Remover del track activo cuando termine
      audio.element.addEventListener('ended', () => {
        this.activeTracks.delete(key);
      }, { once: true });
      
      console.log(`▶️ [AUDIO] Playing audio: ${key}`);
      return true;
      
    } catch (error) {
      console.error(`❌ [AUDIO] Error playing audio ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Para el track más antiguo
   */
  private stopOldestTrack(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const key of this.activeTracks) {
      const audio = this.audioRegistry.get(key);
      if (audio && audio.lastUsed < oldestTime) {
        oldestTime = audio.lastUsed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      const audio = this.audioRegistry.get(oldestKey);
      if (audio && audio.element) {
        audio.element.pause();
        audio.element.currentTime = 0;
        this.activeTracks.delete(oldestKey);
        console.log(`⏹️ [AUDIO] Stopped oldest track: ${oldestKey}`);
      }
    }
  }
  
  /**
   * Limpia audio antiguo
   */
  private cleanupOldestAudio(): void {
    const sortedAudio = Array.from(this.audioRegistry.values())
      .sort((a, b) => a.lastUsed - b.lastUsed);
    
    const audioToRemove = sortedAudio.slice(0, 
      this.audioRegistry.size - ULTRA_ASSET_CONFIG.maxAudioCache + 1
    );
    
    audioToRemove.forEach(audio => {
      if (audio.element) {
        audio.element.pause();
        audio.element.src = '';
        audio.element.remove();
      }
      this.audioRegistry.delete(audio.key);
      this.activeTracks.delete(audio.key);
      console.log(`🧹 [AUDIO] Removed old audio: ${audio.key}`);
    });
  }
  
  /**
   * Estima el tamaño de un archivo de audio
   */
  private estimateAudioSize(url: string): number {
    // Estimación basada en extensión
    if (url.endsWith('.mp3')) return 1024 * 1024; // 1MB
    if (url.endsWith('.ogg')) return 512 * 1024;  // 512KB
    if (url.endsWith('.wav')) return 2 * 1024 * 1024; // 2MB
    return 1024 * 1024; // 1MB por defecto
  }
  
  /**
   * Limpia recursos
   */
  cleanup(): void {
    // Parar todos los tracks activos
    for (const key of this.activeTracks) {
      const audio = this.audioRegistry.get(key);
      if (audio && audio.element) {
        audio.element.pause();
        audio.element.src = '';
      }
    }
    
    this.activeTracks.clear();
    this.audioRegistry.clear();
    
    console.log('🧹 [AUDIO] Audio manager cleaned up');
  }
}

// Instancia global del gestor de assets
export const ultraAssetManager = new UltraAssetManager();

// Exponer API global para debugging
if (typeof window !== 'undefined') {
  (window as any).AssetAPI = {
    ultraAssetManager,
    UltraTextureManager,
    UltraAudioManager,
    ULTRA_ASSET_CONFIG
  };
  
  console.log('🚀 [ASSET] Asset API disponible en consola:');
  console.log('   • AssetAPI.ultraAssetManager');
  console.log('   • AssetAPI.UltraTextureManager');
  console.log('   • AssetAPI.UltraAudioManager');
  console.log('   • AssetAPI.ULTRA_ASSET_CONFIG');
}
