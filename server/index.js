const http = require('http');

const PORT = 8080;

const server = http.createServer();

server.on('request', (req, res) => {
  console.log(`Received request for ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Hello World!\n');
  res.end(`Received request for ${req.url}`);
});

server.on('listening', (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Server running at http://localhost:${PORT}/`);
  }
});

server.listen(PORT);
