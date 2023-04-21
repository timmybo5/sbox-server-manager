import {
  addToHistory,
  loadServerSettings,
  setConfigFiles,
  setConfigName,
  setScrollToBottom,
  updatePlayers,
} from '@renderer/store/SettingsSlice';
import { ConsoleLog } from '@renderer/utils/ConsoleLog';
import { shouldScrollToBottom } from '@renderer/utils/ScrollToBottom';
import { IpcMainEvent } from 'electron';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.scss';
import Console from './console/Console';
import PlayerList, { Player } from './playerlist/PlayerList';
import Settings from './settings/Settings';
import Sidebar from './sidebar/Sidebar';

const App = () => {
  const consoleOutputRef = useRef(null);
  const dispatch = useDispatch();
  const windowAny = window as any;

  // History
  useEffect(() => {
    windowAny.electronAPI.onSendToConsole(
      (event: IpcMainEvent, log: ConsoleLog) => {
        const shouldScroll = shouldScrollToBottom(consoleOutputRef);
        dispatch(setScrollToBottom(shouldScroll));
        dispatch(addToHistory(log));
      },
    );

    return () => windowAny.electronAPI.removeOnSendToConsole();
  }, []);

  // Players
  useEffect(() => {
    windowAny.electronAPI.onPlayersUpdate(
      (event: IpcMainEvent, players: Player[]) => {
        dispatch(updatePlayers(players));
      },
    );

    return () => windowAny.electronAPI.removeOnPlayersUpdate();
  }, []);

  // Load configuration & settings
  useEffect(() => {
    const loadConfigAndSettings = async () => {
      const configFiles: string[] =
        await windowAny.electronAPI.getConfigFiles();
      dispatch(setConfigFiles(configFiles));

      // Auto load the first found setting
      if (configFiles.length > 0) {
        const configName = configFiles[0];
        const result = await windowAny.electronAPI.loadSettings(configName);
        dispatch(loadServerSettings(result));
        dispatch(setConfigName(configName));
      }
    };

    loadConfigAndSettings();
  }, []);

  return (
    <div id='app'>
      <div className='sidebarArea'>
        <Sidebar />
      </div>
      <div className='contentArea'>
        <Routes>
          <Route
            path='/console'
            element={<Console outputRef={consoleOutputRef} />}
          />
          <Route path='/settings' element={<Settings />} />
          <Route path='/players' element={<PlayerList />} />
          <Route path='*' element={<Navigate to='/console' replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
