import { getItem } from './src/storage.js';
import { openConfirm } from './ui/modals.js';

let ipcRenderer = null;
try {
  ipcRenderer = window.electronAPI;
} catch {}

async function exportSave() {
  const data = getItem('gameState');
  if (!data) return;
  if (ipcRenderer) {
    const filePath = await ipcRenderer.invoke('show-save-dialog');
    if (filePath) {
      await ipcRenderer.invoke('save-file', { filePath, data });
    }
  } else {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summonyourwill_save.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}

if (ipcRenderer) {
  ipcRenderer.on('request-close', () => {
    openConfirm({
      message: 'Do you want to export your save before exiting?',
      onConfirm: async () => {
        await exportSave();
        ipcRenderer.send('close-approved');
      },
      onCancel: () => {
        ipcRenderer.send('close-approved');
      }
    });
  });
}

window.offlineEnter = function () {
  try {
    localStorage.setItem('offlineMode', '1');
  } catch {}
  window.location.href = 'index.html';
};

const offlineBtn = document.getElementById('offline-enter-btn');
if (offlineBtn) {
  offlineBtn.addEventListener('click', window.offlineEnter);
}

// Automatically enter offline mode if no connection and a save exists
if (!navigator.onLine && getItem('gameState')) {
  window.offlineEnter();
}
