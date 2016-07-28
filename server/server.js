const http = require('http');
const join = require('path').join;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const denodeify = require('denodeify');
const readFile = denodeify(fs.readFile);
const sqlJS = require('sql.js');

const server = http.createServer(app);

app.use('/data', bodyParser.json());

const dataRouter = express.Router();
app.use(REST_API_PATH, dataRouter);

app.use('/bootstrap', express.static(join(ROOT_DIR, 'node_modules/bootstrap/dist')));
app.use(express.static(join(ROOT_DIR, 'public')));

require('client/isomorphic/index.js')(app);

const webServer = {
  start: (done) => {
    console.log('starting ....');
    global.db = new sqlJS.Database();
    readFile(join(ROOT_DIR, 'server', 'data.sql'), 'utf8')
    .then(data => {
      db.exec(data);
      const projectsRoutes = require('./projects/routes.js');
      Promise.all([
        projectsRoutes(dataRouter, '/projects')
      ])
      .then(() =>
        server.listen(PORT, () => {
          console.log(`Server running at http://localhost:${PORT}/`);
          done();
        })
      )
      .catch(done);
    });
  },
  stop: (done) => {
    console.log(`Closing server at http://localhost:${PORT}/`);
    server.close(done);
  }
};

module.exports = webServer;
