import { addToHistory, dataSelector } from '@renderer/store/DataSlice';
import {
  setScrollToBottom,
  settingsSelector,
} from '@renderer/store/SettingsSlice';
import { ConsoleLog } from '@renderer/utils/ConsoleLog';
import { shouldScrollToBottom } from '@renderer/utils/ScrollToBottom';
import React, { MutableRefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Console.scss';
import ConsoleInput from './ConsoleInput';
import ConsoleOutput from './ConsoleOutput';

interface ConsoleProps {
  outputRef: MutableRefObject<HTMLDivElement>;
}

const Console = ({ outputRef }: ConsoleProps) => {
  const { scrollToBottom } = useSelector(settingsSelector);
  const { history } = useSelector(dataSelector);
  const dispatch = useDispatch();

  const addToOutput = (value: string) => {
    const log: ConsoleLog = {
      type: 'Input',
      value,
    };

    const shouldScroll = shouldScrollToBottom(outputRef);
    dispatch(setScrollToBottom(shouldScroll));
    dispatch(addToHistory(log));
  };

  const onCommand = async (cmd: string) => {
    if (cmd.trim().length == 0) return;

    const res = await window.electronAPI.runCommand(cmd);

    if (res.trim().length > 0) {
      addToOutput(res);
    }
  };

  return (
    <div className='console'>
      <ConsoleOutput
        contentRef={outputRef}
        history={history}
        scrollToBottom={scrollToBottom}
      />
      <ConsoleInput onEnter={onCommand} />
    </div>
  );
};

export default Console;
