// scripts/lint-changed.js
import { ESLint } from "eslint";
import { execSync } from "node:child_process";

const base = process.argv[2] || "develop";
const head = process.argv[3] || "HEAD";

function getChanged() {
  const out = execSync(`node scripts/changed-files.js ${base} ${head}`, { encoding: "utf8" });
  try { return JSON.parse(out); } catch { return []; }
}

const files = getChanged();

if (!files.length) {
  console.log(`[lint-changed] No hay archivos .js/.ts cambiados entre ${base}...${head}.`);
  process.exit(0);
}

const eslint = new ESLint({ fix: false });
const results = await eslint.lintFiles(files);
const formatter = await eslint.loadFormatter("stylish");
const text = formatter.format(results);
if (text) console.log(text);

const hasErrors = results.some(r => r.errorCount > 0);
process.exit(hasErrors ? 1 : 0);
