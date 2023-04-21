import React from 'react';
import './FileBrowser.scss';

interface FileBrowserProps {
  path?: string;
  onPathChange: (path: string) => void;
}

const FileBrowser = ({ path = '', onPathChange }: FileBrowserProps) => {
  const openFileBrowser = async () => {
    const windowAny = window as any;
    const path = await windowAny.electronAPI.openFileBrowser();
    onPathChange(path);
  };

  return (
    <div className='fileBrowser'>
      {path.length == 0 ? (
        <p className='invalid' onClick={openFileBrowser}>
          sbox-server.exe not found!
        </p>
      ) : (
        <p onClick={openFileBrowser}>{path}</p>
      )}
    </div>
  );
};

export default FileBrowser;
