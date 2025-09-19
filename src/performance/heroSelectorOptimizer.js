// Optimizador específico para selectores de héroes
// Reduce el lag en la creación y actualización de opciones de héroes

import { performanceMonitor } from './missionOptimizer.js';

// Cache para opciones de héroes pre-renderizadas
const heroOptionsCache = new Map();
const heroAvailabilityCache = new Map();

// Pool de elementos DOM reutilizables para selectores
class HeroSelectorPool {
  constructor() {
    this.selects = [];
    this.options = [];
    this.maxSize = 20;
  }

  getSelect() {
    if (this.selects.length > 0) {
      return this.selects.pop();
    }
    const select = document.createElement('select');
    select.style.width = '100%';
    return select;
  }

  getOption() {
    if (this.options.length > 0) {
      return this.options.pop();
    }
    return document.createElement('option');
  }

  releaseSelect(select) {
    if (this.selects.length < this.maxSize) {
      select.innerHTML = '';
      select.className = '';
      select.removeAttribute('style');
      select.removeAttribute('disabled');
      this.selects.push(select);
    }
  }

  releaseOption(option) {
    if (this.options.length < this.maxSize * 10) {
      option.textContent = '';
      option.value = '';
      option.disabled = false;
      option.removeAttribute('style');
      option.removeAttribute('title');
      this.options.push(option);
    }
  }
}

export const heroSelectorPool = new HeroSelectorPool();

/**
 * Genera opciones de héroes de forma optimizada
 * @param {Array} heroes - Lista de héroes
 * @param {Function} filterFn - Función de filtrado
 * @param {Function} formatFn - Función de formateo
 * @returns {Array} Opciones optimizadas
 */
export function generateOptimizedHeroOptions(heroes, filterFn = null, formatFn = null) {
  performanceMonitor.start('generateHeroOptions');
  
  const cacheKey = `${heroes.length}_${filterFn ? filterFn.toString() : 'null'}_${formatFn ? formatFn.toString() : 'null'}`;
  
  if (heroOptionsCache.has(cacheKey)) {
    performanceMonitor.end('generateHeroOptions');
    return heroOptionsCache.get(cacheKey);
  }

  const filteredHeroes = filterFn ? heroes.filter(filterFn) : heroes;
  
  const options = filteredHeroes.map(hero => {
    const option = heroSelectorPool.getOption();
    option.value = hero.id;
    
    if (formatFn) {
      option.textContent = formatFn(hero);
    } else {
      option.textContent = hero.name;
    }
    
    return option;
  });

  // Cachear el resultado
  heroOptionsCache.set(cacheKey, options);
  
  // Limpiar cache si es muy grande
  if (heroOptionsCache.size > 50) {
    const firstKey = heroOptionsCache.keys().next().value;
    heroOptionsCache.delete(firstKey);
  }

  performanceMonitor.end('generateHeroOptions');
  return options;
}

/**
 * Crea un selector de héroes optimizado
 * @param {Object} config - Configuración del selector
 * @returns {HTMLElement} Selector optimizado
 */
export function createOptimizedHeroSelector({
  heroes,
  filterFn = null,
  formatFn = null,
  placeholder = 'Choose Hero',
  onChange = null,
  disabled = false,
  className = '',
  style = {}
}) {
  performanceMonitor.start('createHeroSelector');
  
  const select = heroSelectorPool.getSelect();
  
  // Aplicar estilos y clases
  if (className) select.className = className;
  Object.assign(select.style, style);
  select.disabled = disabled;
  
  // Opción placeholder
  const placeholderOpt = heroSelectorPool.getOption();
  placeholderOpt.textContent = placeholder;
  placeholderOpt.value = '';
  select.appendChild(placeholderOpt);
  
  // Generar opciones optimizadas
  const options = generateOptimizedHeroOptions(heroes, filterFn, formatFn);
  options.forEach(option => select.appendChild(option));
  
  // Event listener optimizado
  if (onChange) {
    select.addEventListener('change', onChange);
  }
  
  performanceMonitor.end('createHeroSelector');
  return select;
}

/**
 * Actualiza un selector existente de forma optimizada
 * @param {HTMLElement} select - Selector a actualizar
 * @param {Array} heroes - Nueva lista de héroes
 * @param {Function} filterFn - Función de filtrado
 * @param {Function} formatFn - Función de formateo
 */
export function updateOptimizedHeroSelector(select, heroes, filterFn = null, formatFn = null) {
  performanceMonitor.start('updateHeroSelector');
  
  const currentValue = select.value;
  const placeholder = select.querySelector('option[value=""]');
  
  // Limpiar opciones existentes (mantener placeholder)
  select.innerHTML = '';
  if (placeholder) select.appendChild(placeholder);
  
  // Generar nuevas opciones
  const options = generateOptimizedHeroOptions(heroes, filterFn, formatFn);
  options.forEach(option => select.appendChild(option));
  
  // Restaurar valor seleccionado si es válido
  if (currentValue && heroes.some(h => h.id == currentValue)) {
    select.value = currentValue;
  }
  
  performanceMonitor.end('updateHeroSelector');
}

/**
 * Optimizador para selectores de misiones
 */
export class MissionHeroSelector {
  constructor(container, slot, requiredEnergy) {
    this.container = container;
    this.slot = slot;
    this.requiredEnergy = requiredEnergy;
    this.select = null;
  }
  
  create() {
    this.select = createOptimizedHeroSelector({
      heroes: window.state?.heroes || [],
      filterFn: (hero) => this.isHeroAvailable(hero),
      formatFn: (hero) => `${hero.name} - Energy: ${hero.energia}%`,
      placeholder: 'Choose Hero',
      onChange: (e) => this.onHeroSelect(e),
      className: 'mission-hero-select'
    });
    
    this.container.appendChild(this.select);
    return this.select;
  }
  
  isHeroAvailable(hero) {
    const cacheKey = `hero_${hero.id}_${this.requiredEnergy}`;
    
    if (heroAvailabilityCache.has(cacheKey)) {
      return heroAvailabilityCache.get(cacheKey);
    }
    
    // Verificar disponibilidad
    const isAvailable = hero.energia >= this.requiredEnergy && 
                       !this.isHeroBusy(hero) &&
                       !this.isHeroInOtherMissions(hero);
    
    heroAvailabilityCache.set(cacheKey, isAvailable);
    return isAvailable;
  }
  
  isHeroBusy(hero) {
    return hero.missionTime > 0 || hero.trainTime > 0;
  }
  
  isHeroInOtherMissions(hero) {
    const missions = window.state?.missions || [];
    const dailyMissions = window.state?.dailyMissions || {};
    
    // Verificar misiones normales
    if (missions.some(m => m.heroId === hero.id)) return true;
    
    // Verificar misiones diarias
    for (const dayMissions of Object.values(dailyMissions)) {
      if (dayMissions.some(m => m.heroId === hero.id)) return true;
    }
    
    return false;
  }
  
  onHeroSelect(event) {
    const heroId = parseInt(event.target.value);
    if (!heroId) return;
    
    // Lógica de selección de héroe
    if (window.startMission) {
      const hero = window.state?.heroMap?.get(heroId);
      if (hero) {
        window.startMission(hero, this.slot);
      }
    }
  }
  
  destroy() {
    if (this.select) {
      heroSelectorPool.releaseSelect(this.select);
      this.select.remove();
      this.select = null;
    }
  }
}

/**
 * Optimizador para selectores de GiantBoss
 */
export class GiantBossHeroSelector {
  constructor(container, role, index) {
    this.container = container;
    this.role = role;
    this.index = index;
    this.select = null;
    this.avatar = null;
  }
  
  create() {
    // Crear contenedor
    const box = document.createElement('div');
    box.className = 'mission-slot boss-slot';
    
    // Avatar
    this.avatar = document.createElement('img');
    this.avatar.src = window.EMPTY_SRC || '';
    this.avatar.className = 'mission-avatar empty';
    box.appendChild(this.avatar);
    
    // Selector optimizado
    this.select = createOptimizedHeroSelector({
      heroes: window.state?.heroes || [],
      filterFn: (hero) => this.isHeroAvailable(hero),
      formatFn: (hero) => this.formatHeroOption(hero),
      placeholder: this.role.label,
      onChange: (e) => this.onHeroSelect(e),
      className: 'boss-hero-select'
    });
    
    box.appendChild(this.select);
    this.container.appendChild(box);
    
    return { select: this.select, avatar: this.avatar, box };
  }
  
  isHeroAvailable(hero) {
    const cacheKey = `boss_hero_${hero.id}_${this.role.type}`;
    
    if (heroAvailabilityCache.has(cacheKey)) {
      return heroAvailabilityCache.get(cacheKey);
    }
    
    const isAvailable = (hero.energia || 0) >= 30 && 
                       !this.isHeroBusy(hero) &&
                       !this.isHeroTaken(hero);
    
    heroAvailabilityCache.set(cacheKey, isAvailable);
    return isAvailable;
  }
  
  isHeroBusy(hero) {
    return hero.missionTime > 0 || hero.trainTime > 0;
  }
  
  isHeroTaken(hero) {
    // Verificar si ya está seleccionado en otro slot
    const selects = this.container.querySelectorAll('.boss-hero-select');
    for (const select of selects) {
      if (select !== this.select && select.value == hero.id) {
        return true;
      }
    }
    return false;
  }
  
  formatHeroOption(hero) {
    const roleType = this.role.type;
    const profName = roleType.charAt(0).toUpperCase() + roleType.slice(1);
    const icon = window.professionIcons?.[profName] || '';
    const statLabel = roleType === 'archer' ? 'Dex' : roleType === 'mage' ? 'Int' : 'Str';
    const statVal = roleType === 'archer' ? hero.stats.destreza : 
                   roleType === 'mage' ? hero.stats.inteligencia : 
                   hero.stats.fuerza;
    const hasProf = (hero.professions || []).includes(profName);
    
    let text = `${hasProf ? icon + ' ' : ''}${hero.name} (${statLabel}: ${statVal})`;
    
    if (hasProf) {
      text = `<span style="color: #b28d25">${text}</span>`;
    }
    
    return text;
  }
  
  onHeroSelect(event) {
    const heroId = parseInt(event.target.value);
    if (!heroId) {
      this.updateAvatar(null);
      return;
    }
    
    const hero = window.state?.heroMap?.get(heroId);
    if (hero) {
      this.updateAvatar(hero);
    }
    
    // Trigger refresh si existe
    if (window.refreshBossOptions) {
      window.refreshBossOptions();
    }
  }
  
  updateAvatar(hero) {
    if (!this.avatar) return;
    
    if (hero) {
      this.avatar.src = hero.avatar || window.EMPTY_SRC || '';
      this.avatar.style.objectPosition = `center ${hero.avatarOffset ?? 50}%`;
      this.avatar.classList.toggle('empty', !hero.avatar);
    } else {
      this.avatar.src = window.EMPTY_SRC || '';
      this.avatar.classList.add('empty');
    }
  }
  
  destroy() {
    if (this.select) {
      heroSelectorPool.releaseSelect(this.select);
      this.select.remove();
      this.select = null;
    }
    this.avatar = null;
  }
}

/**
 * Limpiar cache cuando sea necesario
 */
export function clearHeroSelectorCache() {
  heroOptionsCache.clear();
  heroAvailabilityCache.clear();
}

/**
 * Limpiar recursos del pool
 */
export function cleanupHeroSelectorPool() {
  heroSelectorPool.selects.forEach(select => select.remove());
  heroSelectorPool.options.forEach(option => option.remove());
  heroSelectorPool.selects.length = 0;
  heroSelectorPool.options.length = 0;
}
