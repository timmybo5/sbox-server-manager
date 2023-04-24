import { ConsoleLog } from '@renderer/utils/ConsoleLog';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { dialog, ipcMain } from 'electron';
import { appWindow } from './appWindow';
import parseStatusPlayerList from './playerList';
import { getLogValueFromData, runCommand, shouldLog, stopRCON } from './srcds';

let serverProc: ChildProcessWithoutNullStreams;

export interface ServerSettings extends ServerParameters {
  serverPath: string;
}

export type ServerParameters = {
  port: number;
  gamemode: string;
  map: string;
  maxPlayers: number;
  hostname: string;
  rconPass: string;
  extraParams: string;
};

export let activeServerParams: ServerParameters;
let defaultAppWindowTitle: string;

export const startServer = (
  path: string,
  serverParams: ServerParameters,
): ChildProcessWithoutNullStreams => {
  activeServerParams = serverParams;

  const parameters = [
    '+port ' + serverParams.port,
    '+gamemode ' + serverParams.gamemode,
    '+map ' + serverParams.map,
    '+maxplayers ' + serverParams.maxPlayers,
    '+hostname ' + serverParams.hostname,
    '+rcon_password ' + serverParams.rconPass,
    serverParams.extraParams,
  ];

  serverProc = spawn('sbox-server.exe', parameters, {
    cwd: path,
    shell: true,
  });

  if (defaultAppWindowTitle == null) {
    defaultAppWindowTitle = appWindow.getTitle();
  }

  appWindow.setTitle(`SM - ${serverParams.hostname}`);

  setTimeout(updatePlayerList, 5000);

  // stdout
  serverProc.stdout.on('data', (byteArray: Uint8Array) => {
    const data = byteArray.toString().trim();

    if (shouldLog(data)) {
      console.log(`[SRCDS OUT]: ${data}`);

      const log: ConsoleLog = {
        type: 'Output',
        value: getLogValueFromData(data),
      };

      appWindow.webContents.send('sendToConsole', log);
    }
  });

  // stderr
  serverProc.stderr.on('data', (byteArray: Uint8Array) => {
    console.error(`[SRCDS ERR]: ${byteArray}`);
  });

  // on close
  serverProc.on('close', (code: number) => {
    console.log(`[SRCDS] exited with code ${code}`);
  });

  return serverProc;
};

export const killServer = () => {
  if (!isValidServer()) return;

  // Is null in before-quit event
  appWindow?.setTitle(defaultAppWindowTitle);

  // RCON
  stopRCON();

  // process.kill does not always close the process
  // detach so the process doesn't get killed if sm closes faster
  spawn('taskkill', ['/pid', serverProc.pid.toString(), '/f', '/t'], {
    detached: true,
  });
};

export const isValidServer = () => {
  return serverProc != null && serverProc.exitCode == null;
};

const updatePlayerList = () => {
  if (!isValidServer()) {
    appWindow.webContents.send('updatePlayers', []);
    return;
  }

  runCommand(
    'status',
    (data) => {
      const players = parseStatusPlayerList(data);
      appWindow.webContents.send('updatePlayers', players);
    },
    (reply) => {
      console.error(`[RCON ERR]: ${reply}`);
    },
  );

  setTimeout(updatePlayerList, 3000);
};

export const registerServerControlEvents = () => {
  ipcMain.handle('openFileBrowser', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(appWindow, {
      filters: [{ name: 'sbox-server', extensions: ['exe'] }],
    });
    return canceled ? 'cancelled' : filePaths[0];
  });

  ipcMain.handle('runCommand', async (event, cmd: string) => {
    if (!isValidServer()) return '';

    runCommand(
      cmd,
      (reply) => {
        const log: ConsoleLog = {
          type: 'CMDReply',
          value: reply,
        };

        appWindow.webContents.send('sendToConsole', log);
      },
      (reply) => {
        console.error(`[RCON ERR]: ${reply}`);
      },
    );

    return cmd;
  });

  ipcMain.on('kickPlayer', async (event, id: string) => {
    if (!isValidServer()) return;
    runCommand(
      'kickid ' + id + ' "Kicked by Server Manager!"',
      (reply) => {
        const log: ConsoleLog = {
          type: 'CMDReply',
          value: reply,
        };

        appWindow.webContents.send('sendToConsole', log);
      },
      (reply) => {
        console.error(`[RCON ERR]: ${reply}`);
      },
    );

    const log: ConsoleLog = {
      type: 'Manager',
      value: 'Server killed!',
    };

    appWindow.webContents.send('sendToConsole', log);
  });

  ipcMain.on(
    'startServer',
    async (event, filePath: string, serverParams: ServerParameters) => {
      if (isValidServer()) return;

      if (filePath.length == 0) {
        dialog.showMessageBox({
          type: 'warning',
          defaultId: 0,
          title: 'Missing server path!',
          message:
            "Go to settings and use 'Search File' to select sbox-server.exe",
        });
        return;
      }

      const partialPath = filePath.replace(/sbox-server.exe$/, '');
      const serverProc = startServer(partialPath, serverParams);

      const log: ConsoleLog = {
        type: 'Manager',
        value: `Starting server with PID:${serverProc.pid}!`,
      };

      appWindow.webContents.send('sendToConsole', log);
    },
  );

  ipcMain.on('stopServer', async (event) => {
    if (!isValidServer()) return;
    stopRCON();
    killServer();

    const log: ConsoleLog = {
      type: 'Manager',
      value: 'Server killed!',
    };

    appWindow.webContents.send('sendToConsole', log);
  });
};
