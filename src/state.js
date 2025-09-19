export let money = 1000;
export let food = 100;
export let wood = 20;
export let stone = 10;
export let houses = 5;
export let terrain = 1;
export let autoClickActive = false;
export let companions = Array(8).fill(null);
export let farmers = Array(8).fill(null);
export let lumberjacks = Array(8).fill(null);
export let miners = Array(8).fill(null);
export let buildingTask = {
  heroIds: [null, null, null],
  heroes: [null, null, null],
  time: 0,
  cost: 0,
  endAt: 0,
  lastTimeShown: null
};
export let upgradeTasks = {};
export let buildingLevels = {};
export let buildSelectionOpen = false;
export let heroes = [];
export const heroMap = new Map();
export let missions = [];
export let dailyMissions = {};
export let specialBuilderSlots = [];
// Maximum number of terrains the player can own
export const MAX_TERRAIN = 200;

const state = {};
Object.defineProperties(state, {
  money: {
    get: () => money,
    set: v => {
      money = v;
    }
  },
  food: {
    get: () => food,
    set: v => {
      food = v;
    }
  },
  wood: {
    get: () => wood,
    set: v => {
      wood = v;
    }
  },
  stone: {
    get: () => stone,
    set: v => {
      stone = v;
    }
  },
  houses: {
    get: () => houses,
    set: v => {
      houses = v;
    }
  },
  terrain: {
    get: () => terrain,
    set: v => {
      terrain = v;
    }
  },
  autoClickActive: {
    get: () => autoClickActive,
    set: v => {
      autoClickActive = v;
    }
  },
  companions: {
    get: () => companions,
    set: v => {
      companions = v;
    }
  },
  farmers: {
    get: () => farmers,
    set: v => {
      farmers = v;
    }
  },
  lumberjacks: {
    get: () => lumberjacks,
    set: v => {
      lumberjacks = v;
    }
  },
  miners: {
    get: () => miners,
    set: v => {
      miners = v;
    }
  },
  buildingTask: {
    get: () => buildingTask,
    set: v => {
      buildingTask = v;
    }
  },
  upgradeTasks: {
    get: () => upgradeTasks,
    set: v => {
      upgradeTasks = v;
    }
  },
  buildingLevels: {
    get: () => buildingLevels,
    set: v => {
      buildingLevels = v;
    }
  },
  buildSelectionOpen: {
    get: () => buildSelectionOpen,
    set: v => {
      buildSelectionOpen = v;
    }
  },
  heroes: {
    get: () => heroes,
    set: v => {
      heroes = v;
    }
  },
  missions: {
    get: () => missions,
    set: v => {
      missions = v;
    }
  },
  dailyMissions: {
    get: () => dailyMissions,
    set: v => {
      dailyMissions = v;
    }
  },
  specialBuilderSlots: {
    get: () => specialBuilderSlots,
    set: v => {
      specialBuilderSlots = v;
    }
  },
  heroMap: {
    value: heroMap
  },
  MAX_TERRAIN: {
    value: MAX_TERRAIN
  }
});

export default state;
