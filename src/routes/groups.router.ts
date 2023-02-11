import express from 'express';
import { createGroup, getGroup } from '../controllers/group.controller';

const groupsRouter = express.Router();

/* Group Controller */
groupsRouter.post('/', createGroup);
groupsRouter.get('/:groupId', getGroup);

export = groupsRouter;
