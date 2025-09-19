// scripts/changed-files.js
import { execSync } from "node:child_process";

const base = process.argv[2] || "develop";
const head = process.argv[3] || "HEAD";

const out = execSync(`git fetch --all --quiet && git diff --name-only ${base}...${head}`, { encoding: "utf8" });
const files = out
  .split("\n")
  .map(f => f.trim())
  .filter(f => f && (f.endsWith(".js") || f.endsWith(".cjs") || f.endsWith(".mjs") || f.endsWith(".ts")));

// Devuelve en JSON para reutilizar en otros scripts
process.stdout.write(JSON.stringify(files));
