import ArrowDownIcon from '@assets/images/arrow_down.png';
import DeleteIcon from '@assets/images/delete.png';
import { clearHistory } from '@renderer/store/DataSlice';
import { ConsoleLog } from '@renderer/utils/ConsoleLog';
import { shouldScrollToBottom } from '@renderer/utils/ScrollToBottom';
import React, { RefObject, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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
  const dispatch = useDispatch();
  const scrollDown = () => {
    const output = contentRef.current;
    if (output == null) return;
    const scrollDiff = output.scrollHeight - output.clientHeight;
    output.scrollTop = scrollDiff;
  };
  const clear = () => {
    dispatch(clearHistory());
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
      <div className='actionButtons'>
        <button
          className='actionBtn clear'
          style={{ opacity: history.length > 0 ? 0.8 : 0.3 }}
          onClick={clear}
        >
          <img src={DeleteIcon} />
        </button>
        <button
          className='actionBtn'
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
