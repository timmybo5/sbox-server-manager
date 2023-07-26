import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { dataSlice } from './DataSlice';
import { settingsSlice } from './SettingsSlice';

const rootReducer = combineReducers({
  settings: settingsSlice.reducer,
  data: dataSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
