import { BrowserWindow, app, session } from 'electron';
import { createAppWindow } from './appWindow';
import { registerPersistenceEvents } from './persistence';
import { killServer, registerServerControlEvents } from './sbox';
import { versionControl } from './versionControl';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

app.on('ready', () => {
  createAppWindow();

  // CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Content-Security-Policy': ['*'],
      },
    });
  });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createAppWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  killServer();
});

app.whenReady().then(() => {
  versionControl.warnIfNotLatest();
  registerServerControlEvents();
  registerPersistenceEvents();
});
