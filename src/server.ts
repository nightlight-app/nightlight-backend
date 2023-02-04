import express from 'express';
import http from 'http';
import cors from 'cors';
import router from './routes/router';

import { Server } from 'socket.io';
import { connectMongoDB } from './config/mongodb';
import addConnectionEventListener from './sockets';

const createServer = () => {
  const app = express();

  connectMongoDB(); // Connect to MongoDB

  // Middleware
  app.use(express.json()); // Parse JSON bodies
  app.use(cors()); // Enable CORS

  // Routers
  app.use('/', router);

  // Socket IO
  const server = http.createServer(app);
  const io = new Server(server);

  // Add socket.io listeners to server
  addConnectionEventListener(io);

  return server;
};

export default createServer;
