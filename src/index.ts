import createServer from './server';

const PORT = 6060;

// Start the server
createServer().listen(PORT, () => {
  console.log(`Express server is listening on port ${PORT}!`);
});
