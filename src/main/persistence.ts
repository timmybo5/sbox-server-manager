import { app, ipcMain } from 'electron';
import fs from 'fs';
import { ServerSettings } from './sbox';

const userDataPath = app.getPath('userData');
const settingsPath = userDataPath + '/Server Settings/';

if (!fs.existsSync(settingsPath)) {
  fs.mkdirSync(settingsPath);
}

const getConfigFiles = (): string[] => {
  const files = fs.readdirSync(settingsPath);
  const filesNoExt = files.map((f) => f.replace('.json', ''));

  return filesNoExt;
};

export const registerPersistenceEvents = () => {
  ipcMain.on(
    'saveSettings',
    async (event, fileName: string, serverSettings: ServerSettings) => {
      const filePath = settingsPath + fileName + '.json';
      const data = JSON.stringify(serverSettings);

      // C:\Users\XXX\AppData\Roaming\Server Manager\settings
      fs.writeFile(filePath, data, (err) => {
        console.log(err?.message ?? 'Data saved!');
      });
    },
  );

  ipcMain.handle('loadSettings', async (event, fileName: string) => {
    const filePath = settingsPath + fileName + '.json';

    if (!fs.existsSync(filePath)) return '';

    const fileData = fs.readFileSync(filePath);
    const serverSettings = JSON.parse(fileData.toString());

    return serverSettings;
  });

  ipcMain.handle('getConfigFiles', async (event) => {
    return getConfigFiles();
  });

  ipcMain.handle(
    'renameConfigFile',
    async (event, oldname: string, newName: string) => {
      const olFilePath = settingsPath + oldname + '.json';
      const newFilePath = settingsPath + newName + '.json';

      fs.renameSync(olFilePath, newFilePath);

      return getConfigFiles();
    },
  );

  ipcMain.on('deleteConfigFile', async (event, fileName: string) => {
    const filePath = settingsPath + fileName + '.json';
    fs.rmSync(filePath);
  });
};
