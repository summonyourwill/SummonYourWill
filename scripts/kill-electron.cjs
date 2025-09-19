const { execSync } = require('node:child_process');
const cmds = [
  'taskkill /IM SummonYourWill.exe /F',
  'taskkill /IM electron.exe /F',
  'taskkill /IM SummonYourWill-Setup*.exe /F'
];
for (const c of cmds) {
  try {
    execSync(c, { stdio: 'ignore' });
  } catch {}
}
