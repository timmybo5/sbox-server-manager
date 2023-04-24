import { GeneralSettings, ServerSettings } from '@main/sbox';
import { contextBridge, ipcRenderer } from 'electron';

// https://www.electronjs.org/docs/latest/tutorial/ipc
contextBridge.exposeInMainWorld('electronAPI', {
  // Control
  openFileBrowser: (fileName: string, fileExtensions: string[]) =>
    ipcRenderer.invoke('openFileBrowser', fileName, fileExtensions),
  runCommand: (cmd: string) => ipcRenderer.invoke('runCommand', cmd),
  startServer: (
    generalSettings: GeneralSettings,
    serverParams: ServerSettings,
  ) => ipcRenderer.send('startServer', generalSettings, serverParams),
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

  // Heartbeat
  onServerHeartbeat: (callback: () => void) =>
    ipcRenderer.on('serverHeartbeat', callback),
  removeOnServerHeartbeat: () =>
    ipcRenderer.removeAllListeners('serverHeartbeat'),

  // Persistence
  saveGeneralSettings: (generalSettings: GeneralSettings) =>
    ipcRenderer.send('saveGeneralSettings', generalSettings),
  loadGeneralSettings: () => ipcRenderer.invoke('loadGeneralSettings'),

  saveServerSettings: (fileName: string, serverSettings: ServerSettings) =>
    ipcRenderer.send('saveServerSettings', fileName, serverSettings),
  loadServerSettings: (fileName: string) =>
    ipcRenderer.invoke('loadServerSettings', fileName),

  getConfigFiles: () => ipcRenderer.invoke('getConfigFiles'),
  renameConfigFile: (oldname: string, newName: string) =>
    ipcRenderer.invoke('renameConfigFile', oldname, newName),
  deleteConfigFile: (fileName: string) =>
    ipcRenderer.send('deleteConfigFile', fileName),
});
