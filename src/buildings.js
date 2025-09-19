import state from './state.js';

export const BUILD_WOOD_COST = 10;
export const BUILD_STONE_COST = 10;
export const BUILD_ENERGY_COST = 50;

export let extraHouses = 0;
export let MAX_HOUSES = 5;

export function setExtraHouses(val) {
  extraHouses = val;
  recalcMaxHouses();
}

export function recalcMaxHouses() {
  MAX_HOUSES = state.terrain * 5 + extraHouses;
}

export function getTerrainCost() {
  if (state.terrain === 1) return 3000; // second terrain
  if (state.terrain === 2) return 4000; // third terrain
  if (state.terrain === 3) return 8000; // fourth terrain
  if (state.terrain === 4) return 15000; // fifth terrain
  return 15000 + (state.terrain - 4) * 5000; // sixth onward
}
