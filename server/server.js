import http from 'http';
import { join } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import denodeify from 'denodeify';
import sqlJS from 'sql.js';
import iso from 'server/isomorphic/index';

import projectsRoutes from './projects/routes';

const readFile = denodeify(fs.readFile);
const absPath = relPath => join(ROOT_DIR, relPath);
const app = express();

const server = http.createServer(app);
const listen = denodeify(server.listen.bind(server));

app.use('/data', bodyParser.json());

const dataRouter = express.Router(); // eslint-disable-line new-cap
app.use(REST_API_PATH, dataRouter);

app.use('/bootstrap', express.static(absPath('node_modules/bootstrap/dist')));
app.use(express.static(absPath('public')));

iso(app);

app.get('*', (req, res) => res.sendFile(absPath('server/index.html')));

module.exports = {
  start: () => {
    global.db = new sqlJS.Database();
    return readFile(absPath('server/data.sql'), 'utf8')
    .then(data => db.exec(data))
    .then(() => Promise.all([
      projectsRoutes(dataRouter, '/projects'),
    ]))
    .then(() => listen(PORT))
    .then(() => console.log(`Server running at http://localhost:${PORT}/`));
  },
  stop: () => {
    console.log(`Closing server at http://localhost:${PORT}/`);
    server.close();
  },
};
