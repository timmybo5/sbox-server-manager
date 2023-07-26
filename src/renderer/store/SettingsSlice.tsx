import { GeneralSettings, ServerSettings } from '@main/sbox';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from './RenderStore';

export type GeneralSettingPayloadKey = 'serverPath' | 'steamCMDPath';

export type ServerSettingPayloadKey =
  | 'port'
  | 'gamemode'
  | 'map'
  | 'maxPlayers'
  | 'hostname'
  | 'rconPass'
  | 'extraParams';

type GeneralSettingPayload = {
  key: GeneralSettingPayloadKey;
  value: string | boolean;
};

type ServerSettingPayload = {
  key: ServerSettingPayloadKey;
  value: string | number;
};

export const setGeneralSetting =
  createAction<GeneralSettingPayload>('setGeneralSetting');

export const setServerSetting =
  createAction<ServerSettingPayload>('setServerSetting');

export const defaultSettingsState = {
  // General
  steamCMDPath: '',
  serverPath: '',

  // Server
  configName: 'New Server',
  port: 27015,
  gamemode: 'facepunch.sandbox',
  map: 'facepunch.flatgrass',
  maxPlayers: 8,
  hostname: 'Sandbox Server',
  rconPass: 'password',
  extraParams: '',
  scrollToBottom: true,

  configFiles: [] as string[],
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: defaultSettingsState,
  reducers: {
    setScrollToBottom: (state, { payload }) => {
      state.scrollToBottom = payload;
    },
    setConfigFiles: (state, { payload }) => {
      state.configFiles = payload;
    },
    setConfigName: (state, { payload }) => {
      state.configName = payload;

      // Save active config
      const generalSettings: GeneralSettings = {
        activeConfig: state.configName,
        steamCMDPath: state.steamCMDPath,
        serverPath: state.serverPath,
      };

      window.electronAPI.saveGeneralSettings(generalSettings);
    },
    loadGeneralSettings: (state, { payload }) => {
      const serverSettings: GeneralSettings = payload;

      state.steamCMDPath = serverSettings.steamCMDPath;
      state.serverPath = serverSettings.serverPath;
    },
    loadServerSettings: (state, { payload }) => {
      const serverSettings: ServerSettings = payload;

      state.port = serverSettings.port;
      state.gamemode = serverSettings.gamemode;
      state.map = serverSettings.map;
      state.maxPlayers = serverSettings.maxPlayers;
      state.hostname = serverSettings.hostname;
      state.rconPass = serverSettings.rconPass;
      state.extraParams = serverSettings.extraParams;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setServerSetting, (state, { payload }) => {
      (state as any)[payload.key] = payload.value;

      // Save every change
      const serverSettings: ServerSettings = {
        port: state.port,
        gamemode: state.gamemode,
        map: state.map,
        maxPlayers: state.maxPlayers,
        hostname: state.hostname,
        rconPass: state.rconPass,
        extraParams: state.extraParams,
      };

      window.electronAPI.saveServerSettings(state.configName, serverSettings);
    });

    builder.addCase(setGeneralSetting, (state, { payload }) => {
      (state as any)[payload.key] = payload.value;

      // Save every change
      const generalSettings: GeneralSettings = {
        activeConfig: state.configName,
        steamCMDPath: state.steamCMDPath,
        serverPath: state.serverPath,
      };

      window.electronAPI.saveGeneralSettings(generalSettings);
    });
  },
});

export const settingsSelector = (state: RootState) => state.settings;
export const {
  setScrollToBottom,
  loadGeneralSettings,
  loadServerSettings,
  setConfigFiles,
  setConfigName,
} = settingsSlice.actions;
