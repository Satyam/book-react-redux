require('./server.js').start((err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
