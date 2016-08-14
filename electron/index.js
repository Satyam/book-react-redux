import electron from 'electron';
import { join } from 'path';
import { Router as expressRouter } from 'express';

import fs from 'fs';
import denodeify from 'denodeify';
import sqlJS from 'sql.js';

import projectsRoutes from '_server/projects/routes';
import serverIPC from './serverIPC';
import htmlTpl from './htmlTemplate';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;


const absPath = relative => join(ROOT_DIR, relative);


const readFile = denodeify(fs.readFile);
const writeFile = denodeify(fs.writeFile);


const htmlFile = absPath('electron/index.html');

let mainWindow;

const dataRouter = expressRouter();

serverIPC(dataRouter);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  global.db = new sqlJS.Database();
  readFile(absPath('server/data.sql'), 'utf8')
  .then(data => db.exec(data))
  .then(() => Promise.all([
    projectsRoutes(dataRouter, '/projects'),
  ]))
  .then(() =>
    writeFile(
      htmlFile,
      htmlTpl(absPath('bundles'), absPath('node_modules'))
    )
  )
  .then(() => mainWindow.loadURL(`file://${htmlFile}`))
  // Un-comment the following to open the DevTools.
  // .then(() => mainWindow.webContents.openDevTools({mode: 'bottom'}))
  // ---------
  .catch(err => {
    throw err;
  });
});
