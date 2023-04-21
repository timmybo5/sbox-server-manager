import React from 'react';
import './Settings.scss';

interface SettingsBlockProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

const SettingsBlock = ({
  title,
  className = '',
  children,
}: SettingsBlockProps) => {
  return (
    <div className={'settingsBlock ' + className}>
      <p className='header'>{title}</p>
      <div className='content'>{children}</div>
    </div>
  );
};

export default SettingsBlock;
