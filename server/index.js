const http = require('http');

const PORT = 8080;

http.createServer()
  .on('request', (req, res) => {
    console.log(`Received request for ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World!\n');
    res.end(`Received request for ${req.url}`);
  })
  .on('listening', (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log(`Server running at http://localhost:${PORT}/`);
    }
  })
  .listen(PORT);
