import ConsoleIcon from '@assets/images/console.png';
import PlayersIcon from '@assets/images/players.png';
import SettingIcon from '@assets/images/settings.png';
import StopIcon from '@assets/images/shutdown.png';
import StartIcon from '@assets/images/start.png';
import { ServerParameters } from '@main/sbox';
import { settingsSelector } from '@renderer/store/SettingsSlice';
import React from 'react';
import { useSelector } from 'react-redux';
import './Sidebar.scss';
import SidebarButton from './SidebarButton';

const Sidebar = () => {
  const {
    serverPath,
    port,
    gamemode,
    map,
    maxPlayers,
    hostname,
    rconPass,
    extraParams,
  } = useSelector(settingsSelector);
  const windowAny = window as any;

  const constructParams = (): ServerParameters => {
    const serverParams: ServerParameters = {
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
      <SidebarButton iconSrc={SettingIcon} navPath='/settings' />
      <SidebarButton iconSrc={PlayersIcon} navPath='/players' />
      <SidebarButton iconSrc={ConsoleIcon} navPath='/console' />

      <div className='controls'>
        <SidebarButton
          iconSrc={StartIcon}
          onClick={() =>
            windowAny.electronAPI.startServer(serverPath, constructParams())
          }
        />
        <SidebarButton
          iconSrc={StopIcon}
          onClick={() => windowAny.electronAPI.stopServer()}
        />
      </div>
    </div>
  );
};

export default Sidebar;
