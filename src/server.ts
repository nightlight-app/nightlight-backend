import express from 'express';
import http from 'http';
import cors from 'cors';
import groupsRouter from './routes/groups.router';
import usersRouter from './routes/users.router';
import venuesRouter from './routes/venues.router';
import { createBullBoardAdapter } from './queue/setup/bullboard.setup';
import notificationsRouter from './routes/notifications.router';
import helmet from 'helmet';
import { credential } from 'firebase-admin';
import admin from 'firebase-admin';
import { FIREBASE_ADMIN_CONFIG } from './utils/constants';
import { authenticateFirebaseToken } from './middleware/auth.middleware';
import pingsRouter from './routes/pings.router';

const createServer = ({
  shouldRunBullBoard = true,
}: {
  shouldRunBullBoard: boolean;
}) => {
  const app = express();

  // Middleware
  app.use(express.json()); // Parse JSON bodies
  app.use(cors()); // Enable CORS

  // Initialize Firebase app
  if (!admin.apps.length) {
    console.log('INITIALIZING FIREBASE APP');
    admin.initializeApp({
      credential: credential.cert(FIREBASE_ADMIN_CONFIG),
    });
  }

  // Authenticate Firebase token
  if (
    !(
      process.env.ENVIRONMENT === 'development' ||
      process.env.ENVIRONMENT === 'test'
    )
  ) {
    app.use(authenticateFirebaseToken); // Authenticate Firebase token
  }

  // Security
  app.use(helmet());
  app.disable('x-powered-by');

  // Set up bull board
  if (shouldRunBullBoard) {
    console.log('SETTING UP BULL BOARD', process.env.ENVIRONMENT);
    const adapter = createBullBoardAdapter();
    app.use('/bull-board', adapter.getRouter());
    console.log('BULL BOARD SET UP');
  }

  // Routers
  app.use('/groups', groupsRouter);
  app.use('/users', usersRouter);
  app.use('/venues', venuesRouter);
  app.use('/notifications', notificationsRouter);
  app.use('/pings', pingsRouter);

  // Create the server
  return http.createServer(app);
};

export default createServer;
