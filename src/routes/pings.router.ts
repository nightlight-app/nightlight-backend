import {
  removePing,
  respondToPing,
  sendPing,
} from '../controllers/ping.controller';
import express from 'express';

const pingsRouter = express.Router();

/* Ping Controller */
pingsRouter.post('/', sendPing);
pingsRouter.patch('/:pingId/respond', respondToPing);
pingsRouter.delete('/:pingId', removePing);

export = pingsRouter;
