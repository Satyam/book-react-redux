const http = require('http');
const express = require('express');
const app = express();

const PORT = process.env.npm_package_myServerApp_port || 8080;

app.get('*', (req, res) => {
  console.log(`Received request for ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Hello World!\n');
  res.end(`Received request for ${req.url}`);
});

http.createServer(app)
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
