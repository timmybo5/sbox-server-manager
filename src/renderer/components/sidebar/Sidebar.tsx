import ConsoleIcon from '@assets/images/console.png';
import PlayersIcon from '@assets/images/players.png';
import ServerSettingsIcon from '@assets/images/server_settings.png';
import GeneralSettingsIcon from '@assets/images/settings.png';

import StopIcon from '@assets/images/shutdown.png';
import StartIcon from '@assets/images/start.png';
import { ServerSettings } from '@main/sbox';
import { dataSelector } from '@renderer/store/DataSlice';
import { settingsSelector } from '@renderer/store/SettingsSlice';
import React from 'react';
import { useSelector } from 'react-redux';
import './Sidebar.scss';
import SidebarButton from './SidebarButton';

const Sidebar = () => {
  const {
    steamCMDPath,
    serverPath,
    port,
    gamemode,
    map,
    maxPlayers,
    hostname,
    rconPass,
    extraParams,
  } = useSelector(settingsSelector);
  const { serverRunning } = useSelector(dataSelector);
  const windowAny = window as any;

  const constructParams = (): ServerSettings => {
    const serverParams: ServerSettings = {
      port,
      gamemode,
      map,
      maxPlayers,
      hostname,
      rconPass,
      extraParams,
    };

    return serverParams;
  };

  return (
    <div id='sidebar'>
      <SidebarButton
        tooltip='General Settings'
        iconSrc={GeneralSettingsIcon}
        navPath='/settings/general'
      />
      <SidebarButton
        tooltip='Server Settings'
        iconSrc={ServerSettingsIcon}
        navPath='/settings/server'
      />
      <SidebarButton
        tooltip='Player List'
        iconSrc={PlayersIcon}
        navPath='/players'
      />
      <SidebarButton
        tooltip='Console'
        iconSrc={ConsoleIcon}
        navPath='/console'
      />

      <div className='controls'>
        <SidebarButton
          tooltip='Start Server'
          disabled={serverRunning}
          iconSrc={StartIcon}
          onClick={() =>
            windowAny.electronAPI.startServer(
              { steamCMDPath, serverPath },
              constructParams(),
            )
          }
        />
        <SidebarButton
          tooltip='Stop Server'
          disabled={!serverRunning}
          iconSrc={StopIcon}
          onClick={() => windowAny.electronAPI.stopServer()}
        />
      </div>
    </div>
  );
};

export default Sidebar;
