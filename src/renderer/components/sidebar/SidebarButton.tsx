import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.scss';

interface SidebarButtonProps {
  navPath?: string;
  iconSrc: string;
  tooltip?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const SidebarButton = ({
  navPath,
  iconSrc,
  tooltip,
  disabled,
  onClick,
}: SidebarButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <button
      disabled={disabled}
      className={
        'sidebarButton ' +
        (location.pathname + location.search == navPath ? 'active' : '')
      }
      onClick={() => {
        navPath && navigate(navPath);
        onClick && onClick();
      }}
    >
      <img src={iconSrc} />
      {tooltip && (
        <div className='tooltip'>
          <span>{tooltip}</span>
        </div>
      )}
    </button>
  );
};

export default SidebarButton;
