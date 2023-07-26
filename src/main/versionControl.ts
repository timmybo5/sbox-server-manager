// https://github.com/timmybo5/sbox-server-manager/releases/latest
import { compareVersions } from 'compare-versions';
import { dialog, shell } from 'electron';
import https from 'https';
import packageJSON from '../../package.json';

const latestRelease =
  'https://github.com/timmybo5/sbox-server-manager/releases/latest';

const warnIfNotLatest = () => {
  https
    .get(latestRelease, (res) => {
      // 'https://github.com/timmybo5/sbox-server-manager/releases/tag/v1.2.0'
      const location = res.headers.location;
      const latestVersion = location.substring(location.lastIndexOf('/') + 2);
      const currVersion = packageJSON.version;

      if (compareVersions(latestVersion, currVersion) > 0) {
        console.log('you need an update!!');

        dialog
          .showMessageBox({
            type: 'info',
            defaultId: 0,
            title: 'Outdated',
            message: `There is a new version available!\n\nCurrent: ${currVersion}\nLatest: ${latestVersion}`,
            buttons: ['OK', 'Get Latest'],
          })
          .then((result) => {
            if (result.response === 1) {
              shell.openExternal(latestRelease);
            }
          });
      }
    })
    .on('error', (e) => {
      console.error(e);
    });
};

export const versionControl = {
  warnIfNotLatest,
};
