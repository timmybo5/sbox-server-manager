import { ConsoleLog } from '@renderer/utils/ConsoleLog';
import React, { MutableRefObject, useEffect } from 'react';
import './Console.scss';

interface ConsoleOutputProps {
  history: ConsoleLog[];
  scrollToBottom: boolean;
  contentRef: MutableRefObject<HTMLDivElement>;
}

// https://stackoverflow.com/questions/18614301/keep-overflow-div-scrolled-to-bottom-unless-user-scrolls-up
// scroll down auto

const ConsoleOutput = ({
  history,
  scrollToBottom,
  contentRef,
}: ConsoleOutputProps) => {
  // Auto scroll
  useEffect(() => {
    if (contentRef == null) return;
    const output = contentRef.current;
    const heightDiff = output.scrollHeight - output.clientHeight;

    if (scrollToBottom) output.scrollTop = heightDiff;
  }, [history]);

  return (
    <div className='consoleOutput'>
      <div ref={contentRef} className='content'>
        {history.map((log, key) => (
          <p
            key={key}
            className={log.type}
            dangerouslySetInnerHTML={{ __html: log.value }}
          />
        ))}
      </div>
    </div>
  );
};

export default ConsoleOutput;
