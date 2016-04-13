const http = require('http');
const express = require('express');
const app = express();

const PORT = process.env.npm_package_myServerApp_port || 8080;

app.get('/hello', (req, res) => res.send('Hi, long time no see!'));

app.get('/bye', (req, res) => res.send('See you later'));

app.get('*', (req, res) => {
  console.log(`Received request for ${req.url}`);
  res.type('text')
    .status(200)
    .send(`Received request for ${req.url}`);
});

http.createServer(app)
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
