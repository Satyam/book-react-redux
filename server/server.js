const http = require('http');
const join = require('path').join;
const absPath = relPath => join(ROOT_DIR, relPath);
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const denodeify = require('denodeify');
const readFile = denodeify(fs.readFile);
const sqlJS = require('sql.js');

const server = http.createServer(app);
const listen = denodeify(server.listen.bind(server));

app.use('/data', bodyParser.json());

const dataRouter = express.Router();
app.use(REST_API_PATH, dataRouter);

app.use('/bootstrap', express.static(absPath('node_modules/bootstrap/dist')));
app.use(express.static(absPath('public')));

require('server/isomorphic/index')(app);

app.get('*', (req, res) => res.sendFile(absPath('server/index.html')));

module.exports = {
  start: () => {
    global.db = new sqlJS.Database();
    return readFile(absPath('server/data.sql'), 'utf8')
    .then(data => db.exec(data))
    .then(() => {
      const projectsRoutes = require('./projects/routes');
      return Promise.all([
        projectsRoutes(dataRouter, '/projects')
      ]);
    })
    .then(() => listen(PORT))
    .then(() => console.log(`Server running at http://localhost:${PORT}/`));
  },
  stop: () => {
    console.log(`Closing server at http://localhost:${PORT}/`);
    server.close();
  }
};
