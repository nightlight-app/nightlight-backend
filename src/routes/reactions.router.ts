import express from 'express';
import { createReaction } from '../controllers/reaction.controller';

const reactionsRouter = express.Router();

/* Reaction Controller */
reactionsRouter.post('/', createReaction);

export = reactionsRouter;
