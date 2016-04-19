const http = require('http');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

const server = http.createServer(app);

module.exports = server;

const PORT = process.env.npm_package_myServerApp_port || 8080;

fs.readFile(path.join(__dirname, 'data.json'), (err, data) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  global.data = JSON.parse(data);

  app.use('/data', bodyParser.json());

  const projectsRouter = express.Router();
  app.use('/data/v1/projects', projectsRouter);

  const projects = require('./projects.js');
  projects(projectsRouter);

  app.use(express.static(path.join(__dirname, '../public')));

  if (require.main === module) {
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  };
});
