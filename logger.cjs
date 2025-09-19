const levels = ['error', 'warn', 'info'];
const level = process.env.LOG_LEVEL || 'info';

function shouldLog(lvl) {
  if (level === 'silent') return false;
  return levels.indexOf(lvl) <= levels.indexOf(level);
}

module.exports = {
  level,
  info: (...args) => shouldLog('info') && console.log(...args),
  warn: (...args) => shouldLog('warn') && console.warn(...args),
  error: (...args) => shouldLog('error') && console.error(...args),
};
