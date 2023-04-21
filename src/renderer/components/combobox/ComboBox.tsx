import ArrowDownIcon from '@assets/images/arrow_down.png';
import React, { useState } from 'react';
import './ComboBox.scss';

interface ComboBoxProps {
  value: string;
  options: string[];
  onSelect: (option: string) => void;
}

const ComboBox = ({ value, options, onSelect }: ComboBoxProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <div className={'comboBox ' + (open ? 'open' : '')}>
      <button onClick={toggleOpen}>
        {value ?? 'Choose'}
        <img src={ArrowDownIcon} />
      </button>
      <div className='options'>
        {options.map((option, key) => {
          if (option == value) return <React.Fragment />;

          return (
            <div key={key}>
              <button
                className='option'
                onClick={() => {
                  setOpen(false);
                  onSelect(option);
                }}
              >
                {option}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComboBox;
