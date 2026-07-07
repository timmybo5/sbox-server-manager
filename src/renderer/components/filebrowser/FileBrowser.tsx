import React from 'react';
import './FileBrowser.scss';

interface FileBrowserProps {
  path?: string;
  fileName: string;
  fileExtensions: string[];
  placeholder: string;
  onPathChange: (path: string) => void;
  onOpen?: () => Promise<string>;
  disabled?: boolean;
}

const FileBrowser = ({
  path = '',
  placeholder,
  fileName,
  fileExtensions,
  onPathChange,
  onOpen,
  disabled = false,
}: FileBrowserProps) => {
  const openFileBrowser = async () => {
    if (disabled) return;
    const result = onOpen
      ? await onOpen()
      : await window.electronAPI.openFileBrowser(fileName, fileExtensions);
    onPathChange(result);
  };

  return (
    <div className={`fileBrowser${disabled ? ' disabled' : ''}`}>
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
