import ansiRegex from 'ansi-regex';
import { activeServerParams } from './sbox';

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

// Physics 0.01ms, NavMesh 0.00ms, Animation 0.00ms Scene 0.09ms
const pulseSceneReg =
  /Physics[\s\S]*NavMesh[\s\S]*Animation[\s\S]*Scene[\s\S]*ms/;
const stripPulse = (str: string) => {
  return str.replace(pulseSceneReg, '').replace(getFullPulseHostReg(), '');
};

const escapeRegex = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Server Manager testing (0/32) [0:00:31] Network 0.00ms
const pulseHostReg =
  '[\\s\\S]*\\([0-9]{1,2}\\/[0-9]{1,2}\\)[\\s\\S]*Network[\\s\\S]*ms';
const getFullPulseHostReg = () => {
  const reg = !activeServerParams
    ? pulseHostReg
    : `${escapeRegex(activeServerParams.hostname)} ${pulseHostReg}`;
  return new RegExp(reg);
};

export const isHostPulse = (str: string) => {
  return str.match(getFullPulseHostReg());
};

const timeReg = /([0-9]{2}:[0-9]{2}:[0-9]{2})/;
const stripTime = (str: string) => {
  return str.replace(timeReg, '');
};

// Strips Ansi color codes + cursor and console code tricks
export const stripAnsi = (str: string) => {
  return str.replace(ansiRegex(), '');
};

export const getLogValueFromData = (data: string): string => {
  let strippedData = stripPulse(data);
  // console.log('After Pulse: ', data);
  strippedData = stripTime(strippedData);
  // console.log('After Time: ', data);
  strippedData = strippedData.replace(/^\s*Generic /, '');
  // console.log('After Generic: ', data);
  return strippedData.trim();
};

const lineReg = /\r\n|\r|\n/;
export const splitDataInLines = (data: string) => {
  return data.split(lineReg);
};
