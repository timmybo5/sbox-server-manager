import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { settingsSlice } from './SettingsSlice';

const rootReducer = combineReducers({
  settings: settingsSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
