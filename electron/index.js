const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const join = require('path').join;
const absPath = relative => join(ROOT_DIR, relative);

const express = require('express');
const fs = require('fs');
const denodeify = require('denodeify');
const readFile = denodeify(fs.readFile);
const writeFile = denodeify(fs.writeFile);

const sqlJS = require('sql.js');

const htmlTpl = require('./index.html.js');
const htmlFile = absPath('electron/index.html');

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
  readFile(absPath('server/data.sql'), 'utf8')
  .then(data => {
    db.exec(data);
    const projectsRoutes = require('server/projects/routes.js');
    Promise.all([
      projectsRoutes(dataRouter, '/projects')
    ])
    .then(() =>
      writeFile(
        htmlFile,
        htmlTpl(absPath('public/bundles'), absPath('node_modules'))
      )
      .then(() => mainWindow.loadURL(`file://${htmlFile}`))
    )
    // Un-comment the following to open the DevTools.
    .then(() => mainWindow.webContents.openDevTools({mode: 'bottom'}))
    // ---------
    .catch(err => {
      throw err;
    });
  });
});
