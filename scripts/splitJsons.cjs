// scripts/splitJsons.cjs
// Divide villagechief.json y partner.json en archivos *_abilities.json y versiones sin abilities

const fs = require('fs').promises;
const path = require('path');

function getBase() {
  const os = require('os');
  const home = os.homedir();
  const candidates = [
    path.join(home, 'OneDrive', 'Documents', 'SummonYourWillSaves'),
    path.join(home, 'OneDrive', 'Documentos', 'SummonYourWillSaves'),
    path.join(home, 'Documents', 'SummonYourWillSaves'),
    path.join(home, 'Documentos', 'SummonYourWillSaves'),
    path.join(process.cwd(), 'SummonYourWillSaves')
  ];
  for (const c of candidates) {
    try { if (require('fs').existsSync(c)) return c; } catch {}
  }
  return candidates[candidates.length - 1];
}

async function safeReadJson(p) {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch (e) { return null; }
}

async function writeJson(p, data) {
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
}

function normalizeArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return [val];
  return [];
}

async function splitVillageChief(base) {
  const vcPath = path.join(base, 'villagechief.json');
  const vc = await safeReadJson(vcPath);
  if (!vc) { console.log('⚠ No existe villagechief.json, omitido'); return; }

  const abilities = normalizeArray(vc.abilities || vc.habilities);
  const vcClean = { ...vc };
  delete vcClean.abilities;
  delete vcClean.habilities;
  delete vcClean.partnerAbilities; // no pertenece aquí

  await writeJson(vcPath, vcClean);
  await writeJson(path.join(base, 'villagechief_abilities.json'), abilities);
  console.log(`✓ Dividido villagechief.json (${abilities.length} abilities)`);
}

async function splitPartner(base) {
  const partnerPath = path.join(base, 'partner.json');
  const partner = await safeReadJson(partnerPath);
  const savePath = path.join(base, 'save.json');
  const save = await safeReadJson(savePath) || {};
  const vc = save.villageChief || {};

  if (!partner) { console.log('⚠ No existe partner.json, omitido'); return; }

  const abilities = normalizeArray(vc.partnerAbilities);
  const partnerClean = { ...partner };
  delete partnerClean.partnerAbilities;

  await writeJson(partnerPath, partnerClean);
  await writeJson(path.join(base, 'partner_abilities.json'), abilities);
  console.log(`✓ Dividido partner.json (${abilities.length} abilities)`);
}

(async () => {
  const base = getBase();
  console.log('[Split] Base:', base);
  await splitVillageChief(base);
  await splitPartner(base);
  console.log('🎉 Split completado');
})();


