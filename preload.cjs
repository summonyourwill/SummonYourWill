const { contextBridge, ipcRenderer } = require('electron');

// Flag to let renderer scripts know they're running in Electron synchronously
contextBridge.exposeInMainWorld('isElectron', true);

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, listener) => ipcRenderer.on(channel, listener),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data)
});

// Función de cierre de emergencia
contextBridge.exposeInMainWorld('emergencyQuit', () => ipcRenderer.invoke('app:quit'));

contextBridge.exposeInMainWorld('music', {
  list: () => ipcRenderer.invoke('music:list'),
  import: () => ipcRenderer.invoke('music:import'),
  delete: (id) => ipcRenderer.invoke('music:delete', { id }),
  updateDuration: (id, sec) => ipcRenderer.invoke('music:updateDuration', { id, durationSec: sec }),
  exportSnapshot: () => ipcRenderer.invoke('music:exportSnapshot'),
  importSnapshot: (snapshot) => ipcRenderer.invoke('music:importSnapshot', snapshot)
});

contextBridge.exposeInMainWorld('electronStore', {
  get: (key) => ipcRenderer.sendSync('electron-store-get', key),
  set: (key, value) => ipcRenderer.sendSync('electron-store-set', key, value),
  delete: (key) => ipcRenderer.sendSync('electron-store-delete', key)
});
