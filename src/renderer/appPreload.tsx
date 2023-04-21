import { ServerParameters, ServerSettings } from '@main/sbox';
import { contextBridge, ipcRenderer } from 'electron';

// https://www.electronjs.org/docs/latest/tutorial/ipc
contextBridge.exposeInMainWorld('electronAPI', {
  // Control
  openFileBrowser: () => ipcRenderer.invoke('openFileBrowser'),
  runCommand: (cmd: string) => ipcRenderer.invoke('runCommand', cmd),
  startServer: (filePath: string, serverParams: ServerParameters) =>
    ipcRenderer.send('startServer', filePath, serverParams),
  stopServer: () => ipcRenderer.send('stopServer'),
  kickPlayer: (id: string) => ipcRenderer.send('kickPlayer', id),

  // Console
  onSendToConsole: (callback: () => void) =>
    ipcRenderer.on('sendToConsole', callback),
  removeOnSendToConsole: () => ipcRenderer.removeAllListeners('sendToConsole'),

  // Players
  onPlayersUpdate: (callback: () => void) =>
    ipcRenderer.on('updatePlayers', callback),
  removeOnPlayersUpdate: () => ipcRenderer.removeAllListeners('updatePlayers'),

  // Persistence
  saveSettings: (fileName: string, serverSettings: ServerSettings) =>
    ipcRenderer.send('saveSettings', fileName, serverSettings),
  loadSettings: (fileName: string) =>
    ipcRenderer.invoke('loadSettings', fileName),
  getConfigFiles: () => ipcRenderer.invoke('getConfigFiles'),
  renameConfigFile: (oldname: string, newName: string) =>
    ipcRenderer.invoke('renameConfigFile', oldname, newName),
  deleteConfigFile: (fileName: string) =>
    ipcRenderer.send('deleteConfigFile', fileName),
});
