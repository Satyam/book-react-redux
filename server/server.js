const http = require('http');
const join = require('path').join;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
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
    fs.readFile(join(ROOT_DIR, 'server', 'data.sql'), 'utf8', (err, data) => {
      if (err) return done(err);
      db.exec(data);
      const projectsRoutes = require('./projects/routes.js');
      projectsRoutes(dataRouter, '/projects', (err) => {
        if (err) return done(err);
        server.listen(PORT, () => {
          console.log(`Server running at http://localhost:${PORT}/`);
          done();
        });
      });
    });
  },
  stop: (done) => {
    console.log(`Closing server at http://localhost:${PORT}/`);
    server.close(done);
  },
  dataRouter
};

module.exports = webServer;

if (require.main === module) {
  console.log('auto start');
  webServer.start((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}
