import { Player } from '@components/playerlist/PlayerList';
import { GeneralSettings, ServerSettings } from '@main/sbox';
import { IpcMainEvent, contextBridge, ipcRenderer } from 'electron';
import { ConsoleLog } from './utils/ConsoleLog';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export interface ElectronAPI {
  openFileBrowser: (
    fileName: string,
    fileExtensions: string[],
  ) => Promise<string>;
  runCommand: (cmd: string) => Promise<string>;
  startServer: (
    generalSettings: GeneralSettings,
    serverParams: ServerSettings,
  ) => void;
  stopServer: () => void;
  kickPlayer: (id: string) => void;
  onSendToConsole: (
    callback: (event: IpcMainEvent, log: ConsoleLog) => void,
  ) => void;
  removeOnSendToConsole: () => void;
  onPlayersUpdate: (
    callback: (event: IpcMainEvent, players: Player[]) => void,
  ) => void;
  removeOnPlayersUpdate: () => void;
  onServerHeartbeat: (
    callback: (event: IpcMainEvent, isRunning: boolean) => void,
  ) => void;
  removeOnServerHeartbeat: () => void;
  saveGeneralSettings: (generalSettings: GeneralSettings) => void;
  loadGeneralSettings: () => Promise<GeneralSettings>;
  saveServerSettings: (
    fileName: string,
    serverSettings: ServerSettings,
  ) => void;
  loadServerSettings: (fileName: string) => Promise<ServerSettings>;
  getConfigFiles: () => Promise<string[]>;
  renameConfigFile: (oldname: string, newName: string) => Promise<string[]>;
  deleteConfigFile: (fileName: string) => void;
}

const electronAPI = {
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
};

// https://www.electronjs.org/docs/latest/tutorial/ipc
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
