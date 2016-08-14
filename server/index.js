import { start } from './server';

start()
.catch(err => {
  console.error(err);
  process.exit(1);
});
