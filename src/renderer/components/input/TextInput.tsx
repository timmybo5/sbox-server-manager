import React, { useEffect, useState } from 'react';
import './TextInput.scss';

interface TextInputProps {
  value: string;
  placeHolder: string;
  numbersOnly?: boolean;
  emptyAllowed?: boolean;
  onValueChange: (value: string) => void;
}

const TextInput = ({
  value,
  placeHolder,
  numbersOnly,
  emptyAllowed,
  onValueChange,
}: TextInputProps) => {
  const [currValue, setCurrValue] = useState(value);

  // Update
  useEffect(() => {
    setCurrValue(value);
  }, [value]);

  // Debounce update
  useEffect(() => {
    const updateStore = setTimeout(() => {
      if (currValue != value && isValidInput()) {
        onValueChange(currValue);
      }
    }, 400);

    return () => clearTimeout(updateStore);
  }, [currValue]);

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    setCurrValue(event.currentTarget.value);
  };

  const isValidInput = (): boolean => {
    return emptyAllowed || (currValue && currValue.toString().length > 0);
  };

  return (
    <div className='textInput'>
      <input
        className={isValidInput() ? '' : 'invalid'}
        value={currValue}
        onInput={handleInputChange}
        type={numbersOnly ? 'number' : 'text'}
        placeholder={placeHolder}
        spellCheck={false}
      />
    </div>
  );
};

export default TextInput;
