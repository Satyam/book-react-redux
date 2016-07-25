const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const join = require('path').join;
const absPath = relative => join(ROOT_DIR, relative);

const express = require('express');
const fs = require('fs');
const sqlJS = require('sql.js');

const htmlTpl = require('./index.html.js');

let mainWindow;

const dataRouter = express.Router();

require('./serverIPC.js')(dataRouter);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 800, height: 600});

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  global.db = new sqlJS.Database();
  fs.readFile(absPath('server/data.sql'), 'utf8', (err, data) => {
    if (err) throw err;
    db.exec(data);
    const projectsRoutes = require('server/projects/routes.js');
    projectsRoutes(dataRouter, '/projects', (err) => {
      if (err) throw err;
      const htmlFile = absPath('electron/index.html');
      fs.writeFile(
        htmlFile,
        htmlTpl(absPath('public/bundles'), absPath('node_modules')),
        err => {
          if (err) throw err;
          mainWindow.loadURL(`file://${htmlFile}`);
        }
      );

      // Un-comment the following to open the DevTools.
      mainWindow.webContents.openDevTools({mode: 'bottom'});
    });
  });
});
