import ArrowDownIcon from '@assets/images/arrow_down.png';
import { ConsoleLog } from '@renderer/utils/ConsoleLog';
import { shouldScrollToBottom } from '@renderer/utils/ScrollToBottom';
import React, { RefObject, useEffect, useState } from 'react';
import './Console.scss';

interface ConsoleOutputProps {
  history: ConsoleLog[];
  scrollToBottom: boolean;
  contentRef: RefObject<HTMLDivElement>;
}

const ConsoleOutput = ({
  history,
  scrollToBottom,
  contentRef,
}: ConsoleOutputProps) => {
  const [canScroll, setCanScroll] = useState(false);
  const scrollDown = () => {
    const output = contentRef.current;
    if (output == null) return;
    const scrollDiff = output.scrollHeight - output.clientHeight;
    output.scrollTop = scrollDiff;
  };

  useEffect(() => {
    const output = contentRef.current;
    if (output == null) return;
    const checkCanScroll = () => {
      setCanScroll(!shouldScrollToBottom(contentRef));
    };

    setTimeout(() => {
      checkCanScroll();
      output.addEventListener('scroll', checkCanScroll);
    }, 1);
    return () => output.removeEventListener('scroll', checkCanScroll);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (contentRef == null || !scrollToBottom) return;
    scrollDown();
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
      <div>
        <button
          className='scrollBtn'
          style={{ opacity: canScroll ? 0.8 : 0.3 }}
          onClick={scrollDown}
        >
          <img src={ArrowDownIcon} />
        </button>
      </div>
    </div>
  );
};

export default ConsoleOutput;
