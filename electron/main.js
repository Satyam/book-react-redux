const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const spawn = require('child_process').spawn;

const PORT = process.env.npm_package_myWebServer_port || 8080;
const HOST = process.env.npm_package_myWebServer_host || 'http://localhost';

let mainWindow;
let serverProcess;

app.on('window-all-closed', () => {
  serverProcess.kill();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 800, height: 600});

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  serverProcess = spawn(
    'node',
    ['public/lib/server.bundle.js']
  );

  serverProcess.on('close', () => {
    console.log('server process closed');
  });

  serverProcess.stderr.on('data', data => {
    console.error('server process error', data.toString('utf8'));
    app.exit(1);
  });

  serverProcess.stdout.on('data', data => {
    console.log(data.toString('utf8'));

    let args = process.argv[2] || '';
    if (args[0] === '/') args = args.substr(1);
    mainWindow.loadURL(`${HOST}:${PORT}/${args}`);

    // Un-comment the following to open the DevTools.
    // mainWindow.webContents.openDevTools();
  });
});
