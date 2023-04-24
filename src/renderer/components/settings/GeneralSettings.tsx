import FileBrowser from '@components/filebrowser/FileBrowser';
import {
  setGeneralSetting,
  settingsSelector,
} from '@renderer/store/SettingsSlice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Settings.scss';
import SettingsBlock from './SettingsBlock';

const GeneralSettings = () => {
  const { steamCMDPath, serverPath } = useSelector(settingsSelector);
  const dispatch = useDispatch();

  const onSteamCMDPathChange = (path: string) => {
    if (path != 'cancelled' && path.endsWith('steamcmd.exe')) {
      dispatch(
        setGeneralSetting({
          key: 'steamCMDPath',
          value: path,
        }),
      );
    }
  };

  const onServerPathChange = (path: string) => {
    if (path != 'cancelled' && path.endsWith('sbox-server.exe')) {
      dispatch(
        setGeneralSetting({
          key: 'serverPath',
          value: path,
        }),
      );
    }
  };

  return (
    <div id='settings'>
      <SettingsBlock title='SteamCMD Path' className='extraWide'>
        <FileBrowser
          path={steamCMDPath}
          fileName='steamcmd'
          fileExtensions={['exe']}
          placeholder='steamcmd.exe not found!'
          onPathChange={onSteamCMDPathChange}
        />
      </SettingsBlock>
      <SettingsBlock title='Server Path' className='extraWide'>
        <FileBrowser
          path={serverPath}
          fileName='sbox-server'
          fileExtensions={['exe']}
          placeholder='sbox-server.exe not found!'
          onPathChange={onServerPathChange}
        />
      </SettingsBlock>
    </div>
  );
};

export default GeneralSettings;
