const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');

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
      const baseUrl = REST_API_PATH;
      let statusCode = 200;
      const res = {
        status: code => {
          statusCode = code;
          console.log('res.status', code);
          return res;
        },
        send: text => {
          event.sender.send('restAPI', {
            status: statusCode,
            statusText: text,
            data: {}
          });
          console.log('res.send', text);
          return res;
        },
        json: obj => {
          event.sender.send('restAPI', {
            status: statusCode,
            statusText: 'OK',
            data: obj
          });
          console.log('res.json', obj);
          return res;
        }
      };
      const req = {
        method: msg.method.toUpperCase(),
        originalUrl,
        baseUrl,
        url: originalUrl.replace(baseUrl, ''),
        _parsedUrl: parsedUrl,
        body: msg.data ? JSON.parse(msg.data) : {},
        query: parsedUrl.query,
        params: {},
        res
      };
      console.log('req', req);
      webServer.dataRouter(req, res, () => console.log('next called'));
    });

    // Un-comment the following to open the DevTools.
    mainWindow.webContents.openDevTools();
  });
});
