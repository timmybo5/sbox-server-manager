import FileBrowser from '@components/filebrowser/FileBrowser';
import TextInput from '@components/input/TextInput';
import {
  SetSettingPayloadKey,
  setSetting,
  settingsSelector,
} from '@renderer/store/SettingsSlice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Settings.scss';
import SettingsBlock from './SettingsBlock';
import SettingsConfig from './SettingsConfig';

type SettingBlock = {
  title: string;
  value: string;
  placeHolder: string;
  key: SetSettingPayloadKey;
  isNumber?: boolean;
  emptyAllowed?: boolean;
};

const Settings = () => {
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
  const dispatch = useDispatch();

  const onServerPathChange = (path: string) => {
    if (path != 'cancelled' && path.endsWith('sbox-server.exe')) {
      dispatch(
        setSetting({
          key: 'serverPath',
          value: path,
        }),
      );
    }
  };

  const settings: SettingBlock[] = [
    {
      title: 'Port',
      value: port,
      placeHolder: '27015',
      key: 'port',
      isNumber: true,
    },
    {
      title: 'Gamemode',
      value: gamemode,
      placeHolder: 'facepunch.sandbox',
      key: 'gamemode',
    },
    {
      title: 'Map',
      value: map,
      placeHolder: 'facepunch.flatgrass',
      key: 'map',
    },
    {
      title: 'Max Players',
      value: maxPlayers,
      placeHolder: '8',
      key: 'maxPlayers',
    },
    {
      title: 'Hostname',
      value: hostname,
      placeHolder: 'Cool Server',
      key: 'hostname',
    },
    {
      title: 'RCON Password',
      value: rconPass,
      placeHolder: 'password',
      key: 'rconPass',
    },
    {
      title: 'Extra',
      value: extraParams,
      placeHolder: '-tickrate 33',
      key: 'extraParams',
      emptyAllowed: true,
    },
  ];

  return (
    <div id='settings'>
      <SettingsBlock title='Configuration' className='extraWide'>
        <SettingsConfig />
      </SettingsBlock>

      <SettingsBlock title='Server Path'>
        <FileBrowser path={serverPath} onPathChange={onServerPathChange} />
      </SettingsBlock>

      {settings.map((setting, key) => (
        <SettingsBlock key={key} title={setting.title}>
          <TextInput
            value={setting.value}
            placeHolder={setting.placeHolder}
            numbersOnly={setting.isNumber}
            emptyAllowed={setting.emptyAllowed}
            onValueChange={(newValue) => {
              dispatch(
                setSetting({
                  key: setting.key,
                  value: newValue,
                }),
              );
            }}
          />
        </SettingsBlock>
      ))}
    </div>
  );
};

export default Settings;
