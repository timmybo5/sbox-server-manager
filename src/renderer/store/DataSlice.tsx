import { Player } from '@components/playerlist/PlayerList';
import { createSlice } from '@reduxjs/toolkit';
import { ConsoleLog, formatConsoleLog } from '@renderer/utils/ConsoleLog';
import { RootState } from './RenderStore';

const maxHistoryEntries = 500;

export const defaultDataState = {
  serverRunning: false,
  history: [] as ConsoleLog[],
  players: [] as Player[],
};

export const dataSlice = createSlice({
  name: 'data',
  initialState: defaultDataState,
  reducers: {
    addToHistory: (state, { payload }) => {
      const log: ConsoleLog = payload;
      const formattedLog = formatConsoleLog(log);
      state.history = [
        ...state.history.splice(-maxHistoryEntries),
        formattedLog,
      ];
    },
    updatePlayers: (state, { payload }) => {
      state.players = [...payload];
    },
    setServerRunning: (state, { payload }) => {
      state.serverRunning = payload;
    },
  },
});

export const dataSelector = (state: RootState) => state.data;
export const { addToHistory, updatePlayers, setServerRunning } =
  dataSlice.actions;
