const { execSync } = require('node:child_process');
const paths = [
  'dist',
  'C:/dev/SYW-out/dist'
];
for (const p of paths) {
  try {
    execSync(`powershell -NoProfile -Command "if (Test-Path '${p}') { attrib -R -S -H '${p}\\*' /S /D }"`, { stdio: 'ignore' });
  } catch {}
}
