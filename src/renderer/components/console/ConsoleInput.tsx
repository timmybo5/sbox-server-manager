import ArrowRight from '@assets/images/arrow_right.png';
import React, { useState } from 'react';
import './Console.scss';

interface ConsoleInputProps {
  onEnter: (cmd: string) => void;
}

const ConsoleInput = ({ onEnter }: ConsoleInputProps) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnter(value);
      setValue('');
    }
  };

  return (
    <div className='consoleInput'>
      <img src={ArrowRight} />
      <input
        onKeyDown={handleKeyDown}
        value={value}
        onInput={(e) => setValue(e.currentTarget.value)}
        type='text'
        placeholder='Type a command...'
      />
    </div>
  );
};

export default ConsoleInput;
