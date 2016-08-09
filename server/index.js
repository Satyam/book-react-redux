import server from './server';

server.start()
.catch(err => {
  console.error(err);
  process.exit(1);
});
