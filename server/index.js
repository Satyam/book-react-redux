const http = require('http');
const express = require('express');
const app = express();

const PORT = process.env.npm_package_myServerApp_port || 8080;

app.get('/hello/:name?', (req, res) => res.send(`Hi ${req.params.name}, long time no see!`));

app.get('/elect/:fname/:lname?/for/:position', (req, res) => res.send(req.params));

app.get('/search', (req, res) => res.send(`You are searching for "${req.query.q}"`));

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
