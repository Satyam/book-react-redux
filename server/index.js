const http = require('http');
const join = require('path').join;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const server = http.createServer(app);

const PORT = process.env.npm_package_myWebServer_port || 8080;
app.use('/data', bodyParser.json());

const dataRouter = express.Router();
app.use('/data/v2', dataRouter);

app.use('/bootstrap', express.static(join(ROOT_DIR, 'node_modules/bootstrap/dist')));
app.use(express.static(join(ROOT_DIR, 'public')));

require('client/isomorphic/index.js')(app);

const webServer = {
  start: (done) => {
    global.db = new sqlite3.Database(':memory:', (err) => {
      if (err) return done(err);
      fs.readFile(join(ROOT_DIR, 'server', 'data.sql'), 'utf8', (err, data) => {
        if (err) return done(err);
        db.exec(data, (err) => {
          if (err) return done(err);
          const projectsRoutes = require('./projects/routes.js');
          projectsRoutes(dataRouter, '/projects', (err) => {
            if (err) return done(err);
            server.listen(PORT, () => {
              console.log(`Server running at http://localhost:${PORT}/`);
              done();
            });
          });
        });
      });
    });
  },
  stop: (done) => {
    server.close(done);
  }
};

module.exports = webServer;

if (require.main === module) {
  webServer.start((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}
