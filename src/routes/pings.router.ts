import express from 'express';
import {
  removePing,
  respondToPing,
  sendPing,
} from '../controllers/ping.controller';

const pingsRouter = express.Router();

/* Ping Controller */
pingsRouter.post('/', sendPing);
pingsRouter.patch('/:pingId/respond', respondToPing);
pingsRouter.delete('/:pingId', removePing);

export = pingsRouter;
