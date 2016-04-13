const http = require('http');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PORT = process.env.npm_package_myServerApp_port || 8080;

app.use('/data', bodyParser.json());

app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.get('/hello/:name?', (req, res) => res.send(`Hi ${req.params.name}, long time no see!`));

app.get('/elect/:fname/:lname?/for/:position', (req, res) => res.send(req.params));

app.get('/search', (req, res) => res.send(`You are searching for "${req.query.q}"`));

app.get('/bye', (req, res) => res.send('See you later'));

app.post('/form', (req, res) => res.send(`You have entered "${req.body.field1}"`));

app.get('/cookie', (req, res) => {
  var chocolateChips = parseInt(req.cookies.chocolateChip || 0, 10);
  res
    .cookie('chocolateChip', chocolateChips + 1)
    .send(`I now have ${chocolateChips} chocolate chip cookies`);
});

app.get('/naughtyChild', (req, res) => {
  res
    .clearCookie('chocolateChip')
    .send('No cookies for you');
});

app.use(express.static(path.join(__dirname, '../public')));

http.createServer(app)
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
