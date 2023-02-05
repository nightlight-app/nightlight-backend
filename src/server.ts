import express from 'express';
import http from 'http';
import cors from 'cors';
import router from './routes/router';

const createServer = () => {
  const app = express();

  // Middleware
  app.use(express.json()); // Parse JSON bodies
  app.use(cors()); // Enable CORS

  // Routers
  app.use('/', router);

  // Create the server
  return http.createServer(app);
};

export default createServer;
