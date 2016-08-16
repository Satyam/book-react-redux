import { start, stop } from './server';

start()
.then(() => console.log(`Server running at http://localhost:${PORT}/`))
.catch(err => {
  console.error(err);
  process.exit(1);
});

const shutdown = () => stop()
  .then(() => console.log(`Server at  http://localhost:${PORT}/ closed`))
  .then(process.exit);

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
