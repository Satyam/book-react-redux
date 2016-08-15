import { start } from './server';

start()
.then(() => console.log(`Server running at http://localhost:${PORT}/`))
.catch(err => {
  console.error(err);
  process.exit(1);
});
