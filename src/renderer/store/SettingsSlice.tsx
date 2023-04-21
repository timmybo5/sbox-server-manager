import { Player } from '@components/playerlist/PlayerList';
import { ServerSettings } from '@main/sbox';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { ConsoleLog, formatConsoleLog } from '@renderer/utils/ConsoleLog';

export type SetSettingPayloadKey =
  | 'serverPath'
  | 'port'
  | 'gamemode'
  | 'map'
  | 'maxPlayers'
  | 'hostname'
  | 'rconPass'
  | 'extraParams';

type SetSettingPayload = {
  key: SetSettingPayloadKey;
  value: string | number;
};

export const setSetting = createAction<SetSettingPayload>('setSetting');

export const defaultState = {
  configName: 'New Server',
  serverPath: '',
  port: 27015,
  gamemode: 'facepunch.sandbox',
  map: 'facepunch.flatgrass',
  maxPlayers: 8,
  hostname: 'Sandbox Server',
  rconPass: 'password',
  extraParams: '',
  scrollToBottom: true,
  history: [] as ConsoleLog[],
  players: [] as Player[],
  configFiles: [] as string[],
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: defaultState,
  reducers: {
    addToHistory: (state, { payload }) => {
      const log: ConsoleLog = payload;
      const formattedLog = formatConsoleLog(log);
      state.history = [...state.history, formattedLog];
    },
    updatePlayers: (state, { payload }) => {
      state.players = [...payload];
    },
    setScrollToBottom: (state, { payload }) => {
      state.scrollToBottom = payload;
    },
    setConfigFiles: (state, { payload }) => {
      state.configFiles = payload;
    },
    setConfigName: (state, { payload }) => {
      state.configName = payload;
    },
    loadServerSettings: (state, { payload }) => {
      const serverSettings: ServerSettings = payload;

      for (const [key, value] of Object.entries(serverSettings)) {
        (state as any)[key] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setSetting, (state, { payload }) => {
      (state as any)[payload.key] = payload.value;

      // Save every change
      const serverSettings: ServerSettings = {
        serverPath: state.serverPath,
        port: state.port,
        gamemode: state.gamemode,
        map: state.map,
        maxPlayers: state.maxPlayers,
        hostname: state.hostname,
        rconPass: state.rconPass,
        extraParams: state.extraParams,
      };

      (window as any).electronAPI.saveSettings(
        state.configName,
        serverSettings,
      );
    });
  },
});

export const settingsSelector = (state: any) => state.settings;
export const {
  addToHistory,
  updatePlayers,
  setScrollToBottom,
  loadServerSettings,
  setConfigFiles,
  setConfigName,
} = settingsSlice.actions;
