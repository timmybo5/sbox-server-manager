import { spawn } from 'child_process';
import { dialog, ipcMain } from 'electron';
import fs from 'fs';
import * as os from 'node:os';
import path from 'path';
import { appWindow, sendLog } from './appWindow';

const installSboxServer = (steamCMDPath: string, installDir: string): Promise<string> => {
  return new Promise((resolve) => {
    const steamCMDDir = steamCMDPath.replace(/steamcmd\.exe$/i, '');

    // Write a temp batch file to avoid nested PowerShell→cmd quoting issues
    const batchPath = path.join(os.tmpdir(), 'sbox_server_install.bat');
    fs.writeFileSync(
      batchPath,
      [
        '@echo off',
        `steamcmd.exe +force_install_dir "${installDir}" +login anonymous +app_update 1892930 validate +quit`,
        'echo.',
        'echo s^&box server installed! Press any key to close...',
        'pause',
      ].join('\r\n'),
    );

    appWindow?.webContents?.send('sboxServerInstalling');
    sendLog({ type: 'Manager', value: 'Installing s&box server...' });

    const init = spawn(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `Start-Process -FilePath "cmd.exe" -ArgumentList '/c "${batchPath}"' -WorkingDirectory '${steamCMDDir}' -Wait`,
      ],
      { windowsHide: true },
    );

    const cleanup = () => {
      try {
        fs.unlinkSync(batchPath);
      } catch (_) {
        // ignore cleanup errors
      }
    };

    init.on('close', () => {
      cleanup();
      sendLog({ type: 'Manager', value: 's&box server installed successfully!' });
      resolve(path.join(installDir, 'sbox-server.exe'));
    });

    init.on('error', (err) => {
      cleanup();
      sendLog({ type: 'Manager', value: `s&box server install error: ${err.message}` });
      resolve('error');
    });
  });
};

export const registerSboxServerEvents = () => {
  ipcMain.handle('openSboxServerSetup', async (event, steamCMDPath: string) => {
    const { response: isInstalled } = await dialog.showMessageBox(appWindow!, {
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 0,
      title: 'S&box server',
      message: 'Is s&box server installed locally?',
    });

    if (isInstalled === 0) {
      const { canceled, filePaths } = await dialog.showOpenDialog(appWindow!, {
        filters: [{ name: 'sbox-server', extensions: ['exe'] }],
      });
      return canceled ? 'cancelled' : filePaths[0];
    }

    const { response: wantsDownload } = await dialog.showMessageBox(appWindow!, {
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 0,
      title: 'S&box server',
      message: 'Would you like to download and install s&box server?',
    });

    if (wantsDownload !== 0) return 'cancelled';

    if (!steamCMDPath) {
      await dialog.showMessageBox(appWindow!, {
        type: 'warning',
        title: 'S&box server',
        message: 'SteamCMD path is not set. Please configure SteamCMD first.',
      });
      return 'cancelled';
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(appWindow!, {
      properties: ['openDirectory'],
      title: 'Choose s&box server install location',
    });
    if (canceled) return 'cancelled';

    return await installSboxServer(steamCMDPath, filePaths[0]);
  });
};
