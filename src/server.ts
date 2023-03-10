import express from 'express';
import http from 'http';
import cors from 'cors';
import groupsRouter from './routes/groups.router';
import usersRouter from './routes/users.router';
import venuesRouter from './routes/venues.router';
import { startQueueAdapter } from './queue/setup/queue.setup';

const createServer = () => {
  const app = express();

  // Middleware
  app.use(express.json()); // Parse JSON bodies
  app.use(cors()); // Enable CORS

  // Retrieve the bull board adapter
  const adapter = startQueueAdapter();

  // Set up the bull board for development use
  app.use('/bull-board', adapter.getRouter());

  // Start the server for bull board
  app.listen(process.env.QUEUE_PORT, () => {
    console.log(`Example app listening on port ${process.env.QUEUE_PORT}`);
    console.log(
      `Bull-board is available at: http://localhost:${process.env.QUEUE_PORT}/bull-board`
    );
  });

  // Routers
  app.use('/groups', groupsRouter);
  app.use('/users', usersRouter);
  app.use('/venues', venuesRouter);

  // Create the server
  return http.createServer(app);
};

export default createServer;
