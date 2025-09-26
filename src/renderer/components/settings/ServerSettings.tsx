import TextInput from '@components/input/TextInput';
import useFPApi, { ApiResponse } from '@renderer/http/fp.http';
import {
  ServerSettingPayloadKey,
  setServerSetting,
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
  key: ServerSettingPayloadKey;
  isNumber?: boolean;
  fetchSuggestions?: (query: string) => Promise<ApiResponse>;
  emptyAllowed?: boolean;
};

const ServerSettings = () => {
  const {
    port,
    gamemode,
    map,
    maxPlayers,
    hostname,
    password,
    rconPass,
    extraParams,
  } = useSelector(settingsSelector);
  const dispatch = useDispatch();
  const searchPackage = useFPApi();

  const settings: SettingBlock[] = [
    // {
    //   title: 'Port',
    //   value: port.toString(),
    //   placeHolder: '27015',
    //   key: 'port',
    //   isNumber: true,
    // },
    {
      title: 'Hostname',
      value: hostname,
      placeHolder: 'Cool Server',
      key: 'hostname',
    },
    {
      title: 'Gamemode',
      value: gamemode,
      placeHolder: 'facepunch.sandbox',
      key: 'gamemode',
      fetchSuggestions: (query: string) => {
        return searchPackage(query, 'game');
      },
    },
    {
      title: 'Map',
      value: map,
      placeHolder: 'facepunch.flatgrass',
      key: 'map',
      fetchSuggestions: (query: string) => {
        return searchPackage(query, 'map');
      },
    },
    // {
    //   title: 'Max Players',
    //   value: maxPlayers.toString(),
    //   placeHolder: '8',
    //   key: 'maxPlayers',
    // },
    // {
    //   title: 'RCON Password',
    //   value: rconPass,
    //   placeHolder: 'password',
    //   key: 'rconPass',
    // },
    // {
    //   title: 'Server Password',
    //   value: password,
    //   placeHolder: 'password',
    //   key: 'password',
    //   emptyAllowed: true,
    // },
    {
      title: 'Extra',
      value: extraParams,
      placeHolder: '+sv_cheats 1',
      key: 'extraParams',
      emptyAllowed: true,
    },
  ];

  return (
    <div id='settings'>
      <SettingsBlock title='Configuration' className='extraWide'>
        <SettingsConfig />
      </SettingsBlock>

      {settings.map((setting, key) => (
        <SettingsBlock key={key} title={setting.title}>
          <TextInput
            value={setting.value}
            placeHolder={setting.placeHolder}
            numbersOnly={setting.isNumber}
            emptyAllowed={setting.emptyAllowed}
            fetchSuggestions={setting.fetchSuggestions}
            onValueChange={(newValue) => {
              dispatch(
                setServerSetting({
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

export default ServerSettings;
