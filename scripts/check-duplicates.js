import fg from 'fast-glob';
import fs from 'node:fs';

const files = await fg(['src/performance/modalOptimizer.js', 'src/examples/**/*.js']);
let hasIssue = false;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');

  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g;
  let match;
  const seen = {};
  while ((match = importRegex.exec(text))) {
    const names = match[1].split(',').map(s => s.trim());
    for (const name of names) {
      const [id, alias] = name.split(/\s+as\s+/);
      if (!alias && seen[id]) {
        console.error(`[check-duplicates] duplicate import '${id}' in ${file}`);
        hasIssue = true;
      }
      seen[id] = true;
    }
  }

  const declRegex = /(?:^|\s)(?:const|let|class|function)\s+(PerformanceManager|modalPool|UltraMemoryOptimizerAPI)\b/g;
  const decls = {};
  while ((match = declRegex.exec(text))) {
    const id = match[1];
    decls[id] = (decls[id] || 0) + 1;
  }
  for (const [id, count] of Object.entries(decls)) {
    if (count > 1) {
      console.error(`[check-duplicates] multiple declarations of '${id}' in ${file}`);
      hasIssue = true;
    }
  }
}

if (hasIssue) {
  process.exit(1);
}
