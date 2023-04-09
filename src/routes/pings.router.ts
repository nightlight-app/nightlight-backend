import express from 'express';
import { sendPing } from '../controllers/ping.controller';

const pingsRouter = express.Router();

/* Ping Controller */
pingsRouter.post('/', sendPing);

export = pingsRouter;
