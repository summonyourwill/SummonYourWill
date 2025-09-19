export const missionDescriptions = [
  "Explore ancient ruins for treasure",
  "Protect the village from bandits",
  "Gather healing herbs in the dark forest",
  "Escort the trade caravan to the next town",
  "Slay the beast terrorizing the mountains",
  "Rescue the traveler lost in the dunes",
  "Recover the artifact stolen by goblins",
  "Defend the tower from enemy siege",
  "Investigate the mysterious underwater temple",
  "Save villagers trapped in the mine",
  "Explore the icy cave for magic crystals",
  "Defeat the forest bandit leader",
  "Accompany the sage on his pilgrimage",
  "Search for rare ingredients for the alchemist",
  "Help build the bridge over the river",
  "Fight the orc horde at the border",
  "Patrol the trade route for ambushes",
  "Secure the defenses of the northern wall",
  "Tame the raging elemental in the mountains",
  "Find the missing messenger in the swamp",
  "Discover the source of the strange plague",
  "Chase the spies infiltrating the city",
  "Call allies for the coming battle",
  "Test new weapons in the training grounds",
  "Explore the forgotten island beyond the sea",
  "Chart the deepest part of the jungle",
  "Negotiate peace between rival clans",
  "Collect taxes from the outlying farms",
  "Seek wisdom at the ancient library",
  "Escort nobles through the haunted pass",
  "Retrieve a relic from the cursed ruins",
  "Clear monsters from the old quarry",
  "Hunt for the elusive golden stag",
  "Cleanse the corrupted shrine in the hills",
  "Investigate lights seen over the lake",
  "Deliver supplies to the frontier outpost",
  "Guard the royal archives overnight",
  "Investigate strange noises in the sewers",
  "Retrieve lost cargo from the riverbank",
  "Assist farmers during the harvest festival",
  "Reinforce the watchtower at dawn",
  "Scout the canyon for hidden dangers",
];

export const missionExpRewards = [
  1500, 500, 500, 8000, 500, 500, 1500, 1500, 500, 5000, 8000, 5000, 500, 1500,
  1000, 2000, 1000, 2000, 1000, 2000, 1000,
];

function missionDifficulty(id) {
  if ([1, 7, 8, 14].includes(id)) return 'hard';
  if ([4, 11, 15, 17, 19, 21].includes(id)) return 'normal';
  return 'easy';
}

export function missionEnergyCost(id) {
  if ([4, 10, 11, 12, 16, 18, 20].includes(id)) return 100;
  const diff = missionDifficulty(id);
  return diff === 'hard' ? 50 : diff === 'normal' ? 30 : 20;
}

export function missionDuration(id) {
  if ([4, 11].includes(id)) return 43200;
  if ([10, 12].includes(id)) return 28800;
  if ([16, 18, 20].includes(id)) return 10800;
  const diff = missionDifficulty(id);
  return diff === 'hard' ? 7200 : diff === 'normal' ? 3600 : 1800;
}

export function formatMissionTime(t) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}
