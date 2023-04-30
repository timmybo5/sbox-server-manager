import {
  addToHistory,
  setServerRunning,
  updatePlayers,
} from '@renderer/store/DataSlice';
import {
  loadGeneralSettings,
  loadServerSettings,
  setConfigFiles,
  setConfigName,
  setScrollToBottom,
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
import GeneralSettings from './settings/GeneralSettings';
import ServerSettings from './settings/ServerSettings';
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

  // Heartbeat
  useEffect(() => {
    windowAny.electronAPI.onServerHeartbeat(
      (event: IpcMainEvent, isRunning: boolean) => {
        dispatch(setServerRunning(isRunning));
      },
    );

    return () => windowAny.electronAPI.removeOnServerHeartbeat();
  }, []);

  // Load configuration & settings
  useEffect(() => {
    const loadConfigAndSettings = async () => {
      // General
      const generalSettings = await windowAny.electronAPI.loadGeneralSettings();
      dispatch(loadGeneralSettings(generalSettings));

      // Config files
      const configFiles: string[] =
        await windowAny.electronAPI.getConfigFiles();
      dispatch(setConfigFiles(configFiles));

      // Server, auto load the first found setting
      if (configFiles.length > 0) {
        let configName = configFiles[0];

        if (
          generalSettings.activeConfig &&
          configFiles.includes(generalSettings.activeConfig)
        ) {
          configName = generalSettings.activeConfig;
        }

        const serverSettings = await windowAny.electronAPI.loadServerSettings(
          configName,
        );
        dispatch(loadServerSettings(serverSettings));
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
          <Route path='/settings/general' element={<GeneralSettings />} />
          <Route path='/settings/server' element={<ServerSettings />} />
          <Route path='/players' element={<PlayerList />} />
          <Route path='*' element={<Navigate to='/console' replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
