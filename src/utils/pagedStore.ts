// Sistema de Paginación Ultra-Agresivo
// Evita arrays grandes en memoria para reducir RAM de 2000MB a 600-900MB
// Basado en recomendaciones de ChatGPT para Electron

// Configuración ultra-agresiva de paginación
const ULTRA_PAGINATION_CONFIG = {
  maxPageSize: 100,           // Máximo 100 items por página
  maxTotalItems: 500,         // Máximo 500 items totales en memoria
  preloadPages: 1,            // Solo precargar 1 página
  cleanupDelay: 1000,         // ms - limpiar páginas antiguas después de 1 segundo
  maxCacheSize: 50            // Máximo 50 items en cache
};

// Store paginado ultra-agresivo para evitar arrays gigantes
export class PagedStore<T> {
  private currentPage: T[] = [];
  private pageIndex: number = 0;
  private totalItems: number = 0;
  private loadedPages: Map<number, T[]> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private lastAccess: Map<number, number> = new Map();
  
  constructor(
    private loader: (pageIndex: number, pageSize: number) => Promise<{ items: T[], total: number }>,
    private pageSize: number = ULTRA_PAGINATION_CONFIG.maxPageSize
  ) {
    // Limitar tamaño de página
    this.pageSize = Math.min(this.pageSize, ULTRA_PAGINATION_CONFIG.maxPageSize);
  }
  
  /**
   * Carga una página específica
   */
  async load(pageIndex: number): Promise<T[]> {
    try {
      console.log(`📄 [PAGED] Loading page ${pageIndex} (size: ${this.pageSize})`);
      
      // Limpiar páginas antiguas antes de cargar
      this.cleanupOldPages();
      
      // Verificar si la página ya está cargada
      if (this.loadedPages.has(pageIndex)) {
        this.updatePageAccess(pageIndex);
        this.currentPage = this.loadedPages.get(pageIndex)!;
        console.log(`📄 [PAGED] Page ${pageIndex} loaded from cache (${this.currentPage.length} items)`);
        return this.currentPage;
      }
      
      // Cargar nueva página
      const result = await this.loader(pageIndex, this.pageSize);
      
      // Limpiar página anterior para liberar memoria
      this.currentPage = [];
      
      // Actualizar estado
      this.pageIndex = pageIndex;
      this.totalItems = result.total;
      this.currentPage = result.items;
      
      // Cachear página
      this.loadedPages.set(pageIndex, [...result.items]);
      this.updatePageAccess(pageIndex);
      
      // Limpiar páginas excesivas
      this.enforceMemoryLimits();
      
      console.log(`📄 [PAGED] Page ${pageIndex} loaded successfully (${result.items.length}/${result.total} items)`);
      
      return this.currentPage;
      
    } catch (error) {
      console.error(`❌ [PAGED] Error loading page ${pageIndex}:`, error);
      return [];
    }
  }
  
  /**
   * Obtiene la página actual
   */
  current(): T[] {
    return this.currentPage;
  }
  
  /**
   * Obtiene información de paginación
   */
  getPaginationInfo() {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    return {
      currentPage: this.pageIndex,
      totalPages,
      totalItems: this.totalItems,
      pageSize: this.pageSize,
      hasNext: this.pageIndex < totalPages - 1,
      hasPrev: this.pageIndex > 0,
      loadedPagesCount: this.loadedPages.size
    };
  }
  
  /**
   * Navega a la siguiente página
   */
  async next(): Promise<T[]> {
    if (this.pageIndex < Math.ceil(this.totalItems / this.pageSize) - 1) {
      return this.load(this.pageIndex + 1);
    }
    return this.currentPage;
  }
  
  /**
   * Navega a la página anterior
   */
  async prev(): Promise<T[]> {
    if (this.pageIndex > 0) {
      return this.load(this.pageIndex - 1);
    }
    return this.currentPage;
  }
  
  /**
   * Navega a una página específica
   */
  async goTo(pageIndex: number): Promise<T[]> {
    if (pageIndex >= 0 && pageIndex < Math.ceil(this.totalItems / this.pageSize)) {
      return this.load(pageIndex);
    }
    return this.currentPage;
  }
  
  /**
   * Actualiza el acceso a una página
   */
  private updatePageAccess(pageIndex: number) {
    this.lastAccess.set(pageIndex, Date.now());
  }
  
  /**
   * Limpia páginas antiguas para liberar memoria
   */
  private cleanupOldPages() {
    const now = Date.now();
    const pagesToRemove: number[] = [];
    
    // Identificar páginas antiguas
    for (const [pageIndex, lastAccess] of this.lastAccess.entries()) {
      if (now - lastAccess > ULTRA_PAGINATION_CONFIG.cleanupDelay) {
        pagesToRemove.push(pageIndex);
      }
    }
    
    // Remover páginas antiguas
    pagesToRemove.forEach(pageIndex => {
      this.loadedPages.delete(pageIndex);
      this.lastAccess.delete(pageIndex);
      console.log(`🧹 [PAGED] Cleaned up old page ${pageIndex}`);
    });
  }
  
  /**
   * Fuerza límites de memoria ultra-agresivos
   */
  private enforceMemoryLimits() {
    // Limpiar páginas si hay demasiadas
    if (this.loadedPages.size > ULTRA_PAGINATION_CONFIG.preloadPages + 1) {
      const pagesToKeep = [this.pageIndex];
      
      // Mantener página anterior y siguiente si existen
      if (this.pageIndex > 0) {
        pagesToKeep.push(this.pageIndex - 1);
      }
      if (this.pageIndex < Math.ceil(this.totalItems / this.pageSize) - 1) {
        pagesToKeep.push(this.pageIndex + 1);
      }
      
      // Remover páginas no esenciales
      for (const [pageIndex] of this.loadedPages.entries()) {
        if (!pagesToKeep.includes(pageIndex)) {
          this.loadedPages.delete(pageIndex);
          this.lastAccess.delete(pageIndex);
          console.log(`🧹 [PAGED] Removed non-essential page ${pageIndex} (memory limit)`);
        }
      }
    }
    
    // Limpiar páginas si el total de items excede el límite
    let totalCachedItems = 0;
    for (const page of this.loadedPages.values()) {
      totalCachedItems += page.length;
    }
    
    if (totalCachedItems > ULTRA_PAGINATION_CONFIG.maxTotalItems) {
      console.warn(`⚠️ [PAGED] Total cached items (${totalCachedItems}) exceeds limit (${ULTRA_PAGINATION_CONFIG.maxTotalItems})`);
      this.aggressiveCleanup();
    }
  }
  
  /**
   * Limpieza ultra-agresiva de memoria
   */
  private aggressiveCleanup() {
    console.log('🚀 [PAGED] Performing aggressive memory cleanup');
    
    // Mantener solo la página actual
    const currentPageData = this.loadedPages.get(this.pageIndex);
    this.loadedPages.clear();
    this.lastAccess.clear();
    
    if (currentPageData) {
      this.loadedPages.set(this.pageIndex, currentPageData);
      this.lastAccess.set(this.pageIndex, Date.now());
    }
    
    // Forzar garbage collection si está disponible
    if (typeof gc === 'function') {
      gc();
      console.log('🗑️ [PAGED] Garbage collection forzado');
    }
    
    console.log(`🧹 [PAGED] Aggressive cleanup completed. Pages: ${this.loadedPages.size}, Items: ${currentPageData?.length || 0}`);
  }
  
  /**
   * Limpia todos los recursos
   */
  cleanup() {
    this.loadedPages.clear();
    this.lastAccess.clear();
    this.currentPage = [];
    
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    console.log('🧹 [PAGED] All resources cleaned up');
  }
  
  /**
   * Obtiene estadísticas del store
   */
  getStats() {
    let totalCachedItems = 0;
    for (const page of this.loadedPages.values()) {
      totalCachedItems += page.length;
    }
    
    return {
      currentPage: this.pageIndex,
      totalItems: this.totalItems,
      cachedPages: this.loadedPages.size,
      cachedItems: totalCachedItems,
      pageSize: this.pageSize,
      memoryLimit: ULTRA_PAGINATION_CONFIG.maxTotalItems,
      memoryUsage: `${totalCachedItems}/${ULTRA_PAGINATION_CONFIG.maxTotalItems} items`
    };
  }
}

// Store virtualizado ultra-agresivo para listas largas
export class VirtualizedStore<T> {
  private items: T[] = [];
  private visibleRange: { start: number; end: number } = { start: 0, end: 0 };
  private itemHeight: number = 50;
  private containerHeight: number = 0;
  private scrollTop: number = 0;
  private renderBuffer: number = 5; // Solo renderizar 5 items extra arriba/abajo
  
  constructor(
    private itemRenderer: (item: T, index: number) => HTMLElement,
    private container: HTMLElement,
    private itemHeight: number = 50
  ) {
    this.itemHeight = itemHeight;
    this.containerHeight = container.clientHeight;
    this.setupScrollListener();
  }
  
  /**
   * Establece los items para virtualizar
   */
  setItems(items: T[]) {
    // Limpiar items anteriores para liberar memoria
    this.items = [];
    
    // Solo mantener items esenciales si la lista es muy grande
    if (items.length > ULTRA_PAGINATION_CONFIG.maxTotalItems) {
      console.warn(`⚠️ [VIRT] Large item list detected (${items.length} items). Truncating to ${ULTRA_PAGINATION_CONFIG.maxTotalItems}`);
      this.items = items.slice(0, ULTRA_PAGINATION_CONFIG.maxTotalItems);
    } else {
      this.items = items;
    }
    
    this.updateVisibleRange();
    this.render();
    
    console.log(`📋 [VIRT] Virtualized ${this.items.length} items`);
  }
  
  /**
   * Configura el listener de scroll
   */
  private setupScrollListener() {
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop;
      this.updateVisibleRange();
      this.render();
    });
  }
  
  /**
   * Actualiza el rango visible
   */
  private updateVisibleRange() {
    const start = Math.floor(this.scrollTop / this.itemHeight);
    const end = Math.min(
      start + Math.ceil(this.containerHeight / this.itemHeight) + this.renderBuffer,
      this.items.length
    );
    
    this.visibleRange = {
      start: Math.max(0, start - this.renderBuffer),
      end
    };
  }
  
  /**
   * Renderiza solo los items visibles
   */
  private render() {
    // Limpiar contenedor
    this.container.innerHTML = '';
    
    // Crear contenedor con altura total para scroll
    const totalHeight = this.items.length * this.itemHeight;
    const wrapper = document.createElement('div');
    wrapper.style.height = `${totalHeight}px`;
    wrapper.style.position = 'relative';
    
    // Renderizar solo items visibles
    for (let i = this.visibleRange.start; i < this.visibleRange.end; i++) {
      if (i < this.items.length) {
        const itemElement = this.itemRenderer(this.items[i], i);
        itemElement.style.position = 'absolute';
        itemElement.style.top = `${i * this.itemHeight}px`;
        itemElement.style.width = '100%';
        wrapper.appendChild(itemElement);
      }
    }
    
    this.container.appendChild(wrapper);
    
    console.log(`🎨 [VIRT] Rendered items ${this.visibleRange.start}-${this.visibleRange.end} (${this.visibleRange.end - this.visibleRange.start} visible)`);
  }
  
  /**
   * Actualiza la altura del contenedor
   */
  updateContainerHeight(height: number) {
    this.containerHeight = height;
    this.updateVisibleRange();
    this.render();
  }
  
  /**
   * Limpia recursos
   */
  cleanup() {
    this.items = [];
    this.container.innerHTML = '';
    console.log('🧹 [VIRT] Virtualized store cleaned up');
  }
  
  /**
   * Obtiene estadísticas
   */
  getStats() {
    return {
      totalItems: this.items.length,
      visibleItems: this.visibleRange.end - this.visibleRange.start,
      visibleRange: this.visibleRange,
      containerHeight: this.containerHeight,
      itemHeight: this.itemHeight,
      scrollTop: this.scrollTop
    };
  }
}

// Store de datos optimizado ultra-agresivamente
export class UltraOptimizedDataStore<T> {
  private data: T[] = [];
  private cache: Map<string, T[]> = new Map();
  private lastAccess: Map<string, number> = new Map();
  private maxCacheAge: number = 30000; // 30 segundos
  
  constructor(private maxItems: number = ULTRA_PAGINATION_CONFIG.maxTotalItems) {}
  
  /**
   * Establece datos con optimización ultra-agresiva
   */
  setData(data: T[]) {
    // Limpiar datos anteriores
    this.data = [];
    
    // Limitar tamaño si es necesario
    if (data.length > this.maxItems) {
      console.warn(`⚠️ [STORE] Data too large (${data.length} items). Truncating to ${this.maxItems}`);
      this.data = data.slice(0, this.maxItems);
    } else {
      this.data = data;
    }
    
    // Limpiar cache antiguo
    this.cleanupOldCache();
    
    console.log(`📊 [STORE] Data set: ${this.data.length} items`);
  }
  
  /**
   * Obtiene datos con paginación automática
   */
  getData(page: number = 0, pageSize: number = ULTRA_PAGINATION_CONFIG.maxPageSize): T[] {
    const start = page * pageSize;
    const end = start + pageSize;
    
    return this.data.slice(start, end);
  }
  
  /**
   * Filtra datos sin crear copias grandes
   */
  filterData(predicate: (item: T) => boolean): T[] {
    // Usar filter con límite para evitar arrays grandes
    const filtered = this.data.filter(predicate);
    
    if (filtered.length > this.maxItems) {
      console.warn(`⚠️ [STORE] Filtered data too large (${filtered.length} items). Limiting to ${this.maxItems}`);
      return filtered.slice(0, this.maxItems);
    }
    
    return filtered;
  }
  
  /**
   * Busca datos con límite de resultados
   */
  searchData(query: string, searchKey: keyof T, maxResults: number = 50): T[] {
    const results: T[] = [];
    const queryLower = query.toLowerCase();
    
    for (const item of this.data) {
      if (results.length >= maxResults) break;
      
      const value = String(item[searchKey]).toLowerCase();
      if (value.includes(queryLower)) {
        results.push(item);
      }
    }
    
    return results;
  }
  
  /**
   * Cachea resultados con expiración
   */
  cacheResult(key: string, data: T[]) {
    this.cache.set(key, data);
    this.lastAccess.set(key, Date.now());
    
    // Limpiar cache si es muy grande
    if (this.cache.size > ULTRA_PAGINATION_CONFIG.maxCacheSize) {
      this.cleanupOldCache();
    }
  }
  
  /**
   * Obtiene resultado cacheado
   */
  getCachedResult(key: string): T[] | null {
    const lastAccess = this.lastAccess.get(key);
    if (lastAccess && Date.now() - lastAccess < this.maxCacheAge) {
      return this.cache.get(key) || null;
    }
    
    // Remover cache expirado
    this.cache.delete(key);
    this.lastAccess.delete(key);
    
    return null;
  }
  
  /**
   * Limpia cache antiguo
   */
  private cleanupOldCache() {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (const [key, lastAccess] of this.lastAccess.entries()) {
      if (now - lastAccess > this.maxCacheAge) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      this.cache.delete(key);
      this.lastAccess.delete(key);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`🧹 [STORE] Cleaned up ${keysToRemove.length} expired cache entries`);
    }
  }
  
  /**
   * Limpia todos los recursos
   */
  cleanup() {
    this.data = [];
    this.cache.clear();
    this.lastAccess.clear();
    console.log('🧹 [STORE] All resources cleaned up');
  }
  
  /**
   * Obtiene estadísticas
   */
  getStats() {
    return {
      dataItems: this.data.length,
      cacheEntries: this.cache.size,
      maxItems: this.maxItems,
      maxCacheSize: ULTRA_PAGINATION_CONFIG.maxCacheSize
    };
  }
}

// Exponer API global para debugging
if (typeof window !== 'undefined') {
  (window as any).PagedStoreAPI = {
    PagedStore,
    VirtualizedStore,
    UltraOptimizedDataStore,
    ULTRA_PAGINATION_CONFIG
  };
  
  console.log('🚀 [PAGED] Paged Store API disponible en consola:');
  console.log('   • PagedStoreAPI.PagedStore');
  console.log('   • PagedStoreAPI.VirtualizedStore');
  console.log('   • PagedStoreAPI.UltraOptimizedDataStore');
  console.log('   • PagedStoreAPI.ULTRA_PAGINATION_CONFIG');
}
