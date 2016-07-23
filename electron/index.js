const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');

const PORT = process.env.npm_package_myWebServer_port || 8080;
const HOST = process.env.npm_package_myWebServer_host || 'http://localhost';

let mainWindow;

const webServer = require('server/server.js');

app.on('window-all-closed', () => {
  webServer.stop();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 800, height: 600});

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  webServer.start(() => {
    let args = process.argv[2] || '';
    if (args[0] === '/') args = args.substr(1);
    mainWindow.loadURL(`${HOST}:${PORT}/${args}`);
    electron.ipcMain.on('restAPI', (event, msg) => {
      console.log('ipc', msg);
      const parsedUrl = url.parse(msg.url, true);
      const originalUrl = msg.url.replace(`${HOST}:${PORT}`, '');
      const baseUrl = '/data/v2';
      const res = {
        status: code => console.log('res.status', code),
        send: text => console.log('res.send', text)
      };
      const req = {
        method: msg.method.toUpperCase(),
        originalUrl,
        baseUrl,
        url: originalUrl.replace(baseUrl, ''),
        body: msg.data || {},
        query: parsedUrl.query,
        params: {},
        res
      };
      console.log('req', req);
      webServer.dataRouter(req, res, () => console.log('next called'));
    });

    // Un-comment the following to open the DevTools.
    // mainWindow.webContents.openDevTools();
  });
});
