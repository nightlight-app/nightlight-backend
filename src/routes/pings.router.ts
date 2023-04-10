import express from 'express';
import { respondToPing, sendPing } from '../controllers/ping.controller';

const pingsRouter = express.Router();

/* Ping Controller */
pingsRouter.post('/', sendPing);
pingsRouter.patch('/:pingId/respond', respondToPing);

export = pingsRouter;
