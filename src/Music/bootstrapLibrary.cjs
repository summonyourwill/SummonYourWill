const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BUILTIN_DIR = path.join(__dirname, 'mp3files');

function fileUri(p){
  return encodeURI('file://' + p.replace(/\\/g,'/'));
}

function bootstrapBuiltIns(index){
  let changed = false;
  let files = [];
  try {
    files = fs.readdirSync(BUILTIN_DIR).filter(f => f.toLowerCase().endsWith('.mp3'));
  } catch (e) {
    return { index, changed: false };
  }
  files.forEach(file => {
    const exists = index.find(t => t.builtIn && t.filename === file);
    if (!exists){
      index.push({
        id: crypto.randomUUID(),
        title: path.parse(file).name,
        filename: file,
        absPath: fileUri(path.resolve(BUILTIN_DIR, file)),
        durationSec: 0,
        addedAt: new Date().toISOString(),
        builtIn: true
      });
      changed = true;
    }
  });
  return { index, changed };
}

module.exports = { bootstrapBuiltIns, BUILTIN_DIR };
