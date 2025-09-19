// src/system/otherGamesIntegration.js
const fs = require('fs/promises');
const path = require('path');
const { app } = require('electron');

async function readJson(filePath, fallback = {}) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === 'ENOENT') return fallback;
    console.warn('[OtherGames] readJson failed:', err);
    return fallback;
  }
}

async function writeJsonAtomic(filePath, dataObj) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = filePath + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(dataObj, null, 2), 'utf8');
  await fs.rename(tmp, filePath);
}

function getSavesDir() {
  const documents = app.getPath('documents');
  return path.join(documents, 'SummonYourWillSaves');
}

function getOtherGamesPath() {
  return path.join(getSavesDir(), 'OtherGames.json');
}

function getSavePath() {
  return path.join(getSavesDir(), 'save.json');
}

function getMoneyAccessor(save) {
  if (!save || typeof save !== 'object') {
    save = {};
  }
  return {
    get: () => (typeof save.money === 'number' ? save.money : 0),
    set: (v) => (save.money = v),
    location: 'save.money'
  };
}

function sumValidValues(obj) {
  return Object.values(obj || {}).reduce((acc, val) => {
    const n = Number(val);
    return acc + (Number.isFinite(n) && n > 0 ? n : 0);
  }, 0);
}

async function importOtherGamesGold() {
  const otherPath = getOtherGamesPath();
  const savePath = getSavePath();

  const otherGames = await readJson(otherPath, {});
  const toImport = sumValidValues(otherGames);

  if (toImport <= 0) {
    return { imported: 0, message: 'No gold to import', otherGamesCount: Object.keys(otherGames).length };
  }

  const save = await readJson(savePath, {});
  const acc = getMoneyAccessor(save);
  const current = acc.get();
  acc.set(current + toImport);
  const saveWrite = writeJsonAtomic(savePath, save);

  const reset = {};
  for (const k of Object.keys(otherGames)) reset[k] = 0;
  fs.writeFile(otherPath, JSON.stringify(reset, null, 2), 'utf8')
    .catch(err => console.warn('[OtherGames] reset failed:', err));

  await saveWrite;

  return {
    imported: toImport,
    moneyField: acc.location,
    otherGamesCount: Object.keys(otherGames).length
  };
}

module.exports = {
  importOtherGamesGold,
  getSavesDir,
  getOtherGamesPath,
  getSavePath
};
