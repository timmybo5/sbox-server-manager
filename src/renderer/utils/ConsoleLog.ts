type ConsoleLogType = 'Manager' | 'Input' | 'Output' | 'CMDReply' | 'Error';

export type ConsoleLog = {
  type: ConsoleLogType;
  value: string;
};

export const formatConsoleLog = (log: ConsoleLog) => {
  switch (log.type) {
    case 'Manager':
      log.value = '[SM] ' + log.value;
      break;
    case 'Input':
      log.value = '> ' + log.value;
      break;
    case 'Error':
    case 'Output':
      log.value = getTimeStringForLog() + log.value;
      break;
  }

  return log;
};

const getTimeStringForLog = () => {
  const d = new Date();
  let timeStr = d.toLocaleTimeString();
  timeStr = timeStr.replace('AM', '').replace('PM', '').trim();

  return `<span>[${timeStr}] </span>`;
};
