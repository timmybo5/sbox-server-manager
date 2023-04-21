import Button from '@components/button/Button';
import ComboBox from '@components/combobox/ComboBox';
import TextInput from '@components/input/TextInput';
import { ServerSettings } from '@main/sbox';
import {
  defaultState,
  loadServerSettings,
  setConfigFiles,
  setConfigName,
  settingsSelector,
} from '@renderer/store/SettingsSlice';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Settings.scss';

const SettingsConfig = () => {
  const { configName, configFiles } = useSelector(settingsSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (configFiles.length == 0) {
      createConfig(true);
    }
  }, [configFiles]);

  const changeConfig = async (configName: string) => {
    const windowAny: any = window;
    const result = await windowAny.electronAPI.loadSettings(configName);
    console.log(configName);
    console.log(result);
    dispatch(loadServerSettings(result));
    dispatch(setConfigName(configName));
  };

  const renameConfig = async (newConfigName: string) => {
    const windowAny: any = window;
    const configFiles = await windowAny.electronAPI.renameConfigFile(
      configName,
      newConfigName,
    );

    dispatch(setConfigFiles(configFiles));
    dispatch(setConfigName(newConfigName));
  };

  const createConfig = async (force = false) => {
    if (!force && configName == defaultState.configName) return;
    const windowAny: any = window;
    const serverSettings: ServerSettings = {
      serverPath: defaultState.serverPath,
      port: defaultState.port,
      gamemode: defaultState.gamemode,
      map: defaultState.map,
      maxPlayers: defaultState.maxPlayers,
      hostname: defaultState.hostname,
      rconPass: defaultState.rconPass,
      extraParams: defaultState.extraParams,
    };

    await windowAny.electronAPI.saveSettings(
      defaultState.configName,
      serverSettings,
    );

    dispatch(loadServerSettings(serverSettings));
    dispatch(setConfigName(defaultState.configName));
    dispatch(setConfigFiles([...configFiles, defaultState.configName]));
  };

  const deleteConfig = async () => {
    if (configFiles.length <= 1) return;
    const windowAny: any = window;
    await windowAny.electronAPI.deleteConfigFile(configName);

    const newConfigFiles = (configFiles as string[]).filter(
      (e) => e != configName,
    );
    dispatch(setConfigFiles([...newConfigFiles]));

    // Load first config in list or create new if none
    if (configFiles.length > 0) {
      changeConfig(newConfigFiles[0]);
    } else {
      createConfig();
    }
  };

  return (
    <div className='settingsConfig'>
      <ComboBox
        value={configName}
        options={configFiles}
        onSelect={changeConfig}
      />

      <TextInput
        value={configName}
        placeHolder={'Config Name...'}
        onValueChange={renameConfig}
      />

      <Button
        disabled={configName == defaultState.configName}
        className='new'
        onClick={createConfig}
      >
        New
      </Button>
      <Button
        disabled={configFiles.length <= 1}
        className='delete'
        onClick={deleteConfig}
      >
        Delete
      </Button>
    </div>
  );
};

export default SettingsConfig;
