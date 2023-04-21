import React from 'react';
import './Button.scss';

interface ButtonProps {
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick: () => void;
}

const Button = ({ disabled, className, children, onClick }: ButtonProps) => {
  return (
    <button
      className={'button ' + className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
