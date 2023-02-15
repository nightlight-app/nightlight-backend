import express from 'express';
import http from 'http';
import cors from 'cors';
import groupsRouter from './routes/groups.router';
import usersRouter from './routes/users.router';
import venuesRouter from './routes/venues.router';

const createServer = () => {
  const app = express();

  // Middleware
  app.use(express.json()); // Parse JSON bodies
  app.use(cors()); // Enable CORS

  // Routers
  app.use('/group', groupsRouter);
  app.use('/user', usersRouter);
  app.use('/venue', venuesRouter);

  // Create the server
  return http.createServer(app);
};

export default createServer;
