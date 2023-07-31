import { execSync } from 'child_process';
import { default as RCON, default as Rcon } from 'rcon-srcds';
import { activeServerParams } from './sbox';

let serverRCON: Rcon;

const blacklistOutputReg = /^([0-9]{2}:[0-9]{2}:[0-9]{2})( engine\/E)?$/;
export const shouldLog = (data: string): boolean => {
  if (
    data.length == 0 ||
    // SCRDS needs console handle for input, ignore warnings
    data.includes('!GetNumberOfConsoleInputEvents') ||
    data == 'engine/E'
  )
    return false;

  const hits = blacklistOutputReg.exec(data);
  return hits == null;
};

const dataToLogReg = /^([0-9]{2}:[0-9]{2}:[0-9]{2})(.*)$/;
export const getLogValueFromData = (data: string): string => {
  const hits = dataToLogReg.exec(data);
  return hits == null ? data : hits[2];
};

export const findHostAddress = (port: number): string => {
  const data = execSync('netstat.exe -a -n -o | findstr.exe :' + port);
  const splitStats = data
    .toString()
    .split(' ')
    .filter((i) => i);
  let nextValueIsAddr = false;
  let addrWithPort: string;

  splitStats.every((value) => {
    if (value == 'TCP') {
      nextValueIsAddr = true;
    } else if (nextValueIsAddr) {
      addrWithPort = value;
      return false;
    }

    return true;
  });

  const addr = addrWithPort.split(':')[0];
  //console.log(addr);

  return addr;
};

// https://github.com/EnriqCG/rcon-srcds
export const initRCON = (port: number): RCON => {
  const addr = findHostAddress(port);
  return new Rcon({ host: addr, port });
};

export const stopRCON = () => {
  serverRCON?.disconnect();
  serverRCON = null;
};

export const runCommand = async (
  cmd: string,
  onSuccess: (reply: string) => void,
  onFail: (reply: string) => void,
) => {
  if (serverRCON == null) {
    serverRCON = initRCON(activeServerParams.port);
  }

  if (!serverRCON.isAuthenticated()) {
    await serverRCON.authenticate(activeServerParams.rconPass);
  }

  const racePromise: Promise<string> = new Promise((resolve) =>
    setTimeout(resolve, 100, 'Command not found.'),
  );

  // Prevent RCON util hanging and returning results minutes later
  const result = await Promise.any([
    racePromise,
    serverRCON.execute(cmd).catch(onFail),
  ]);

  if (typeof result === 'string') {
    onSuccess(result);
  } else {
    onFail('Error while running command: ' + cmd);
  }
};
