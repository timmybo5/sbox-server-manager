import { ConsoleLog } from '@renderer/utils/ConsoleLog';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { dialog, ipcMain } from 'electron';
import { IPty, spawn as ptySpawn } from 'node-pty';
import * as os from 'node:os';
import path from 'path';
import { appWindow } from './appWindow';
import parseStatusPlayerList from './playerList';
import {
  getLogValueFromData,
  isHostPulse,
  shouldLog,
  splitDataInLines,
  stripAnsi,
} from './srcds';

const appID = 1892930;
const updateServerCMD = `+force_install_dir #serverPath +login anonymous +app_update ${appID} +quit`;

let updateProc: ChildProcessWithoutNullStreams;
let serverProc: IPty;
let isStoppingServer = false;
let startedHeartbeat = false;
let outputWaitingForCommand = false;
let prevCommand = '';
let connectedToSteam = false;
let collectPlayerInfo = false;
let collectingPlayerInfo = false;
let statusCMDInfo: string[] = [];

export type GeneralSettings = {
  activeConfig?: string;
  steamCMDPath: string;
  serverPath: string;
};

export type ServerSettings = {
  port: number;
  gamemode: string;
  map: string;
  maxPlayers: number;
  hostname: string;
  password: string;
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

  appWindow.webContents?.send('sendToConsole', log);

  // stdout
  updateProc.stdout.on('data', (byteArray: Uint8Array) => {
    const data = byteArray.toString().trim();

    if (shouldLog(data)) {
      console.log(`[STEAMCMD OUT]: ${data}`);

      const log: ConsoleLog = {
        type: 'Output',
        value: getLogValueFromData(data),
      };

      appWindow.webContents?.send('sendToConsole', log);
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

type StartParameter = {
  key: string;
  value: string;
  wrap?: boolean;
};

const constructStartParameters = (parameters: StartParameter[]): string[] => {
  const startParms: string[] = [];

  parameters.forEach((parm) => {
    if (parm.value) {
      const value = parm.wrap ? `"${parm.value}"` : parm.value;
      startParms.push(parm.key + ' ' + value);
    }
  });

  return startParms;
};

const startServer = (
  serverPath: string,
  serverParams: ServerSettings,
): IPty => {
  activeServerParams = serverParams;

  const startParms = constructStartParameters([
    { key: '+game', value: `${serverParams.gamemode} ${serverParams.map}` },
    { key: '+hostname', value: serverParams.hostname, wrap: true },
    // {
    //   key: '+net_game_server_token',
    //   value: '',
    // },
    // Temporarily disabled until these flags are added again
    // { key: '+maxplayers', value: serverParams.maxPlayers.toString() },
    // { key: '+rcon_password', value: serverParams.rconPass, wrap: true },
    // { key: '+sv_password', value: serverParams.password, wrap: true },
    { key: '', value: serverParams.extraParams },
  ]);

  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  const exePath = path.join(serverPath, 'sbox-server.exe');

  // Wrap exePath to make sure paths with spaces work, & to fix PS issue with quotes
  const shellCMD = [`& "${exePath}"`].concat(startParms);

  console.log({ exePath, startParms });

  updateProc = null;
  serverProc = ptySpawn(shell, shellCMD, {
    cwd: serverPath,
    cols: 999,
    rows: 30,
    name: 'xterm-color',
    env: process.env,
    useConpty: false, // Fallback to legacy to force same output format on different OS versions
  });

  // log
  const log: ConsoleLog = {
    type: 'Manager',
    value: `Starting server with PID:${serverProc.pid}!`,
  };

  appWindow.webContents?.send('sendToConsole', log);

  // window title
  activeAppWindowTitle = 'SM - Starting...';
  appWindow.setTitle(activeAppWindowTitle);

  // Stream
  serverProc.onData((data) => {
    const lines = splitDataInLines(data);
    lines.forEach(processData);
  });

  // Close
  serverProc.onExit((data) => {
    serverProc = null;

    const msg = `[SRCDS] exited with code: ${data.exitCode}, signal: ${
      data.signal ?? '-'
    }`;
    console.log(msg);

    // Is null in before-quit event
    activeAppWindowTitle = defaultAppWindowTitle;
    appWindow?.setTitle(defaultAppWindowTitle);

    const log: ConsoleLog = {
      type: 'Error',
      value: msg,
    };

    appWindow.webContents?.send('sendToConsole', log);
  });

  return serverProc;
};

const processData = (data: string) => {
  // Strip special characters
  data = stripAnsi(data);

  // console.log(data);

  // Set title, block when waiting for cmd output to finish
  if (connectedToSteam && isHostPulse(data) && !prevCommand) {
    activeAppWindowTitle = `SM - ${data}`;
    appWindow.setTitle(activeAppWindowTitle);
  }

  let msg = getLogValueFromData(data);
  if (msg.length === 0) return;

  // We can now send commands
  if (!connectedToSteam && msg.includes('Connected to Steam')) {
    connectedToSteam = true;
    setTimeout(updatePlayerList, 5000);
  }

  // Collecting status info
  // Server Startup: From '> status' to 'Not connected'
  // Normal: From '> status' to '>'
  if ((collectPlayerInfo && msg === '> status') || collectingPlayerInfo) {
    collectPlayerInfo = false;
    collectingPlayerInfo = true;
    prevCommand = ''; // Not needed, we block output here

    if (['>', 'Not connected'].includes(msg)) {
      collectingPlayerInfo = false;
    } else {
      statusCMDInfo.push(msg);
    }
    return;
  }

  // Commands cause extra output
  const cmdPrefix = '> ' + prevCommand;
  if ((prevCommand && !msg.startsWith(cmdPrefix)) || msg === '>') {
    outputWaitingForCommand = true;
    return;
  } else {
    if (outputWaitingForCommand) {
      outputWaitingForCommand = false;
      msg = msg.slice(cmdPrefix.length).trim();
      prevCommand = '';
    }
  }

  if (msg.length === 0) return;

  const log: ConsoleLog = {
    type: 'Output',
    value: msg,
  };

  appWindow.webContents?.send('sendToConsole', log);
};

export const killServer = () => {
  if (!isValidServer()) return;

  // process.kill does not always close the process
  // detach so the process doesn't get killed if sm closes faster
  const pid = updateProc != null ? updateProc.pid : serverProc.pid;
  spawn('taskkill', ['/pid', pid.toString(), '/f', '/t'], {
    detached: true,
  });
};

export const isValidServer = () => {
  return (
    serverProc != null || (updateProc != null && updateProc.exitCode == null)
  );
};

const updatePlayerList = () => {
  if (!isValidServer()) {
    appWindow.webContents?.send('updatePlayers', []);
    return;
  }

  collectPlayerInfo = true;

  setTimeout(() => {
    const players = parseStatusPlayerList(statusCMDInfo);
    appWindow.webContents?.send('updatePlayers', players);
    statusCMDInfo = [];
  }, 1000);

  runCommand(
    'status',
    () => {
      // Empty for now
    },
    (reply) => {
      console.error(`[RCON ERR]: ${reply}`);
    },
  );

  setTimeout(updatePlayerList, 5000);
};

const serverHeartbeat = () => {
  appWindow.webContents?.send('serverHeartbeat', isValidServer());
  setTimeout(serverHeartbeat, 1000);
};

export const runCommand = async (
  cmd: string,
  onSuccess: () => void,
  onFail: (reason: string) => void,
) => {
  if (!isValidServer()) return onFail('Invalid server process');
  if (!connectedToSteam) return;
  serverProc.write(`${cmd}\r\n`);
  prevCommand = cmd;
  onSuccess();
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
      () => {
        /* No reply atm */
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
      'kick ' + id + ' "Kicked by Server Manager!"',
      () => {
        const log: ConsoleLog = {
          type: 'CMDReply',
          value: `Kicked player ${id}!`,
        };

        appWindow.webContents?.send('sendToConsole', log);
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

    killServer();

    const log: ConsoleLog = {
      type: 'Manager',
      value: 'Server killed!',
    };

    appWindow.webContents?.send('sendToConsole', log);
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
