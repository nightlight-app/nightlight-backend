import express from 'express';
import {
  createGroup,
  deleteGroup,
  getGroup,
} from '../controllers/group.controller';

const groupsRouter = express.Router();

/* Group Controller */
groupsRouter.post('/', createGroup);
groupsRouter.get('/:groupId', getGroup);
groupsRouter.delete('/:groupId', deleteGroup);

export = groupsRouter;
