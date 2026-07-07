import { spawn } from 'child_process';
import { dialog, ipcMain } from 'electron';
import fs from 'fs';
import https from 'https';
import * as os from 'node:os';
import path from 'path';
import { appWindow, sendLog } from './appWindow';

const installSteamCMD = (installDir: string): Promise<string> => {
  return new Promise((resolve) => {
    const zipPath = path.join(os.tmpdir(), 'steamcmd_setup.zip');
    const downloadUrl =
      'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';

    sendLog({ type: 'Manager', value: 'Downloading SteamCMD...' });

    const file = fs.createWriteStream(zipPath);
    https
      .get(downloadUrl, (res) => {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          sendLog({ type: 'Manager', value: 'Extracting SteamCMD...' });

          const extract = spawn(
            'powershell',
            [
              '-NoProfile',
              '-Command',
              `Expand-Archive -Path "${zipPath}" -DestinationPath "${installDir}" -Force`,
            ],
            { windowsHide: true },
          );

          extract.on('close', () => {
            try {
              fs.unlinkSync(zipPath);
            } catch (_) {
              // ignore cleanup errors
            }

            appWindow.webContents?.send('steamCMDInstalling');
            sendLog({ type: 'Manager', value: 'Initializing SteamCMD...' });

            const init = spawn(
              'powershell',
              [
                '-NoProfile',
                '-Command',
                `Start-Process -FilePath "cmd.exe" -ArgumentList '/c "steamcmd.exe +quit & echo. & echo SteamCMD setup complete! Press any key to close... & pause"' -WorkingDirectory '${installDir}' -Wait`,
              ],
              { windowsHide: true },
            );

            init.on('close', () => {
              sendLog({ type: 'Manager', value: 'SteamCMD installed successfully!' });
              resolve(path.join(installDir, 'steamcmd.exe'));
            });

            init.on('error', (err) => {
              sendLog({ type: 'Manager', value: `SteamCMD init error: ${err.message}` });
              resolve('error');
            });
          });

          extract.on('error', (err) => {
            sendLog({ type: 'Manager', value: `Extraction error: ${err.message}` });
            resolve('error');
          });
        });
      })
      .on('error', (err) => {
        sendLog({ type: 'Manager', value: `Download error: ${err.message}` });
        resolve('error');
      });
  });
};

export const registerSteamCMDEvents = () => {
  ipcMain.handle('openSteamCMDSetup', async () => {
    const { response: isInstalled } = await dialog.showMessageBox(appWindow, {
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 0,
      title: 'SteamCMD',
      message: 'Is SteamCMD installed locally?',
    });

    if (isInstalled === 0) {
      const { canceled, filePaths } = await dialog.showOpenDialog(appWindow, {
        filters: [{ name: 'steamcmd', extensions: ['exe'] }],
      });
      return canceled ? 'cancelled' : filePaths[0];
    }

    const { response: wantsDownload } = await dialog.showMessageBox(appWindow, {
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 0,
      title: 'SteamCMD',
      message: 'Would you like to download and install SteamCMD?',
    });

    if (wantsDownload !== 0) return 'cancelled';

    const { canceled, filePaths } = await dialog.showOpenDialog(appWindow, {
      properties: ['openDirectory'],
      title: 'Choose SteamCMD install location',
    });
    if (canceled) return 'cancelled';

    return await installSteamCMD(filePaths[0]);
  });
};
