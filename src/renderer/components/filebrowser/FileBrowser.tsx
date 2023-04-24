import React from 'react';
import './FileBrowser.scss';

interface FileBrowserProps {
  path?: string;
  fileName: string;
  fileExtensions: string[];
  placeholder: string;
  onPathChange: (path: string) => void;
}

const FileBrowser = ({
  path = '',
  placeholder,
  fileName,
  fileExtensions,
  onPathChange,
}: FileBrowserProps) => {
  const openFileBrowser = async () => {
    const windowAny = window as any;
    const path = await windowAny.electronAPI.openFileBrowser(
      fileName,
      fileExtensions,
    );
    onPathChange(path);
  };

  return (
    <div className='fileBrowser'>
      {path.length == 0 ? (
        <p className='invalid' onClick={openFileBrowser}>
          {placeholder}
        </p>
      ) : (
        <p onClick={openFileBrowser}>{path}</p>
      )}
    </div>
  );
};

export default FileBrowser;
