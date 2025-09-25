import { inDev } from '@src/utils/helpers';
import { app, BrowserWindow } from 'electron';
import path from 'path';

// Electron Forge automatically creates these entry points
declare const APP_WINDOW_WEBPACK_ENTRY: string;
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export let appWindow: BrowserWindow;

/**
 * Create Application Window
 * @returns {BrowserWindow} Application Window Instance
 */
export function createAppWindow(): BrowserWindow {
  // Create new window instance
  appWindow = new BrowserWindow({
    height: 600,
    minHeight: 600,
    width: 800,
    minWidth: 800,
    maxWidth: 1000,
    backgroundColor: '#202020',
    show: false,
    icon: path.resolve('assets/icons/logo_small.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
      sandbox: false,
      webSecurity: false, // Fixes CORS with requests sent from renderer
      devTools: inDev(),
    },
  });

  // Prevent menu bar from opening
  appWindow.setMenuBarVisibility(false);

  // Load the index.html of the app window.
  appWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY);

  // Show window when its ready to
  appWindow.on('ready-to-show', () => appWindow.show());

  // Close all windows when main window is closed
  appWindow.on('close', () => {
    appWindow = null;
    app.quit();
  });

  return appWindow;
}
