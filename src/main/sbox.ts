import { ConsoleLog } from '@renderer/utils/ConsoleLog';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { dialog, ipcMain } from 'electron';
import { appWindow } from './appWindow';
import parseStatusPlayerList from './playerList';
import { getLogValueFromData, runCommand, shouldLog, stopRCON } from './srcds';

const appID = 1892930;
const updateServerCMD = `+force_install_dir #serverPath +login anonymous +app_update ${appID} +quit`;

let updateProc: ChildProcessWithoutNullStreams;
let serverProc: ChildProcessWithoutNullStreams;
let isStoppingServer = false;
let startedHeartbeat = false;

export type GeneralSettings = {
  activeConfig: string;
  steamCMDPath: string;
  serverPath: string;
};

export type ServerSettings = {
  port: number;
  gamemode: string;
  map: string;
  maxPlayers: number;
  hostname: string;
  rconPass: string;
  extraParams: string;
};

export let activeServerParams: ServerSettings;
let defaultAppWindowTitle: string;
let activeAppWindowTitle: string;

const updateAndStartServer = (
  steamCMDPath: string,
  serverPath: string,
  serverParams: ServerSettings,
) => {
  // window title
  defaultAppWindowTitle ??= appWindow.getTitle();
  activeAppWindowTitle = 'SM - Updating...';
  appWindow.setTitle(activeAppWindowTitle);

  updateServer(steamCMDPath, serverPath);

  updateProc.on('close', (code: number) => {
    if (!isStoppingServer) {
      startServer(serverPath, serverParams);
    }
  });

  if (!startedHeartbeat) {
    startedHeartbeat = true;
    serverHeartbeat();
  }
};

const updateServer = (steamCMDPath: string, serverPath: string) => {
  const parameter = updateServerCMD.replace('#serverPath', serverPath);

  console.log(steamCMDPath + ' - ' + serverPath + ' - ' + parameter);

  updateProc = spawn('steamcmd.exe', [parameter], {
    cwd: steamCMDPath,
    shell: true,
  });

  // log
  const log: ConsoleLog = {
    type: 'Manager',
    value: `Checking for updates...`,
  };

  appWindow.webContents.send('sendToConsole', log);

  // stdout
  updateProc.stdout.on('data', (byteArray: Uint8Array) => {
    const data = byteArray.toString().trim();

    if (shouldLog(data)) {
      console.log(`[STEAMCMD OUT]: ${data}`);

      const log: ConsoleLog = {
        type: 'Output',
        value: getLogValueFromData(data),
      };

      appWindow.webContents.send('sendToConsole', log);
    }
  });

  // stderr
  updateProc.stderr.on('data', (byteArray: Uint8Array) => {
    console.error(`[STEAMCMD ERR]: ${byteArray}`);
  });

  updateProc.on('close', (code: number) => {
    console.log(`[STEAMCMD] exited with code ${code}`);
  });
};

const startServer = (
  serverPath: string,
  serverParams: ServerSettings,
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

  updateProc = null;
  serverProc = spawn('sbox-server.exe', parameters, {
    cwd: serverPath,
    shell: true,
  });

  // log
  const log: ConsoleLog = {
    type: 'Manager',
    value: `Starting server with PID:${serverProc.pid}!`,
  };

  appWindow.webContents.send('sendToConsole', log);

  // window title
  activeAppWindowTitle = `SM - ${serverParams.hostname}`;
  appWindow.setTitle(activeAppWindowTitle);

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
  const pid = updateProc != null ? updateProc.pid : serverProc.pid;
  spawn('taskkill', ['/pid', pid.toString(), '/f', '/t'], {
    detached: true,
  });
};

export const isValidServer = () => {
  return (
    (serverProc != null && serverProc.exitCode == null) ||
    (updateProc != null && updateProc.exitCode == null)
  );
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
      appWindow.setTitle(
        `${activeAppWindowTitle} - ${players.length}/${activeServerParams.maxPlayers}`,
      );
    },
    (reply) => {
      console.error(`[RCON ERR]: ${reply}`);
    },
  );

  setTimeout(updatePlayerList, 3000);
};

const serverHeartbeat = () => {
  appWindow.webContents.send('serverHeartbeat', isValidServer());
  setTimeout(serverHeartbeat, 1000);
};

export const registerServerControlEvents = () => {
  ipcMain.handle(
    'openFileBrowser',
    async (event, fileName: string, fileExtensions: string[]) => {
      const { canceled, filePaths } = await dialog.showOpenDialog(appWindow, {
        filters: [{ name: fileName, extensions: fileExtensions }],
      });
      return canceled ? 'cancelled' : filePaths[0];
    },
  );

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
  });

  ipcMain.on(
    'startServer',
    async (
      event,
      generalSettings: GeneralSettings,
      serverSettings: ServerSettings,
    ) => {
      if (isValidServer()) return;
      isStoppingServer = false;

      if (generalSettings.steamCMDPath.length == 0) {
        showWarningBox(
          'Missing SteamCMD path!',
          'Go to general settings and select steamcmd.exe',
        );
        return;
      }

      if (generalSettings.serverPath.length == 0) {
        showWarningBox(
          'Missing server path!',
          'Go to general settings and select sbox-server.exe',
        );
        return;
      }

      const partialSteamCMDPath = generalSettings.steamCMDPath.replace(
        /steamcmd.exe$/,
        '',
      );

      const partialServerPath = generalSettings.serverPath.replace(
        /sbox-server.exe$/,
        '',
      );

      updateAndStartServer(
        partialSteamCMDPath,
        partialServerPath,
        serverSettings,
      );
    },
  );

  ipcMain.on('stopServer', async (event) => {
    if (!isValidServer()) return;
    isStoppingServer = true;

    stopRCON();
    killServer();

    const log: ConsoleLog = {
      type: 'Manager',
      value: 'Server killed!',
    };

    appWindow.webContents.send('sendToConsole', log);
  });
};

const showWarningBox = (title: string, message: string) => {
  dialog.showMessageBox({
    type: 'warning',
    defaultId: 0,
    title,
    message,
  });
};
