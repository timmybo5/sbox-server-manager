import { app, ipcMain } from 'electron';
import fs from 'fs';
import { ServerSettings } from './sbox';

// C:\Users\XXX\AppData\Roaming\Server Manager\
const userDataPath = app.getPath('userData');
const generalSettingsPath = userDataPath + '/General Settings/';
const serverSettingsPath = userDataPath + '/Server Settings/';

const saveData = (fileName: string, path: string, data: any) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  const filePath = path + fileName + '.json';
  const jsonData = JSON.stringify(data);

  fs.writeFile(filePath, jsonData, (err) => {
    console.log(err?.message ?? `Data saved in ${fileName}`);
  });
};

const loadData = (fileName: string, path: string): any => {
  const filePath = path + fileName + '.json';

  if (!fs.existsSync(filePath)) return '';

  const fileData = fs.readFileSync(filePath);
  const parsedData = JSON.parse(fileData.toString());

  return parsedData;
};

const getConfigFiles = (): string[] => {
  const files = fs.readdirSync(serverSettingsPath);
  const filesNoExt = files.map((f) => f.replace('.json', ''));

  return filesNoExt;
};

export const registerPersistenceEvents = () => {
  ipcMain.on(
    'saveServerSettings',
    async (event, fileName: string, serverSettings: ServerSettings) => {
      saveData(fileName, serverSettingsPath, serverSettings);
    },
  );

  ipcMain.handle('loadServerSettings', async (event, fileName: string) => {
    return loadData(fileName, serverSettingsPath);
  });

  ipcMain.on(
    'saveGeneralSettings',
    async (event, generalSettings: ServerSettings) => {
      saveData('general', generalSettingsPath, generalSettings);
    },
  );

  ipcMain.handle('loadGeneralSettings', async (event) => {
    return loadData('general', generalSettingsPath);
  });

  ipcMain.handle('getConfigFiles', async (event) => {
    return getConfigFiles();
  });

  ipcMain.handle(
    'renameConfigFile',
    async (event, oldname: string, newName: string) => {
      const olFilePath = serverSettingsPath + oldname + '.json';
      const newFilePath = serverSettingsPath + newName + '.json';

      fs.renameSync(olFilePath, newFilePath);

      return getConfigFiles();
    },
  );

  ipcMain.on('deleteConfigFile', async (event, fileName: string) => {
    const filePath = serverSettingsPath + fileName + '.json';
    fs.rmSync(filePath);
  });
};
