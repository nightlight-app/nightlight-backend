import express from 'express';
import {
  createReaction,
  deleteReaction,
} from '../controllers/reaction.controller';

const reactionsRouter = express.Router();

/* Reaction Controller */
reactionsRouter.post('/', createReaction);
reactionsRouter.delete('/:reactionId', deleteReaction);

export = reactionsRouter;
