// scripts/pruneVillageChief.cjs
const fs = require('fs');
const path = require('path');
const os = require('os');

function resolveBase() {
  const home = os.homedir();
  const candidates = [
    path.join(home, 'OneDrive', 'Documents', 'SummonYourWillSaves'),
    path.join(home, 'OneDrive', 'Documentos', 'SummonYourWillSaves'),
    path.join(home, 'Documents', 'SummonYourWillSaves'),
    path.join(home, 'Documentos', 'SummonYourWillSaves'),
    path.join(process.cwd(), 'SummonYourWillSaves')
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c; } catch {}
  }
  return candidates[candidates.length - 1];
}

(async () => {
  const BASE = resolveBase();
  const p = path.join(BASE, 'villagechief.json');
  if (!fs.existsSync(p)) {
    console.error('❌ No existe', p);
    process.exit(1);
  }
  const raw = fs.readFileSync(p, 'utf8');
  const json = JSON.parse(raw);
  delete json.habilities;
  delete json.abilities;
  delete json.partnerAbilities;
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(json, null, 2), 'utf8');
  fs.renameSync(tmp, p);
  const size = Buffer.byteLength(JSON.stringify(json));
  console.log('✅ villagechief.json recortado. Tamaño actual (bytes):', size);
})();


