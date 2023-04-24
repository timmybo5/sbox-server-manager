import Button from '@components/button/Button';
import ComboBox from '@components/combobox/ComboBox';
import TextInput from '@components/input/TextInput';
import { ServerSettings } from '@main/sbox';
import {
  defaultSettingsState,
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
      createServerConfig(true);
    }
  }, [configFiles]);

  const changeConfig = async (configName: string) => {
    const windowAny: any = window;
    const result = await windowAny.electronAPI.loadServerSettings(configName);
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

  const createServerConfig = async (force = false) => {
    if (!force && configName == defaultSettingsState.configName) return;
    const windowAny: any = window;
    const serverSettings: ServerSettings = {
      port: defaultSettingsState.port,
      gamemode: defaultSettingsState.gamemode,
      map: defaultSettingsState.map,
      maxPlayers: defaultSettingsState.maxPlayers,
      hostname: defaultSettingsState.hostname,
      rconPass: defaultSettingsState.rconPass,
      extraParams: defaultSettingsState.extraParams,
    };

    await windowAny.electronAPI.saveServerSettings(
      defaultSettingsState.configName,
      serverSettings,
    );

    dispatch(loadServerSettings(serverSettings));
    dispatch(setConfigName(defaultSettingsState.configName));
    dispatch(setConfigFiles([...configFiles, defaultSettingsState.configName]));
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
      createServerConfig();
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
        disabled={configName == defaultSettingsState.configName}
        className='new'
        onClick={createServerConfig}
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
