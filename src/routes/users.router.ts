import express from 'express';
import {
  createUser,
  getUser,
  deleteUser,
} from '../controllers/user.controller';

const usersRouter = express.Router();

/* User Controller */
usersRouter.post('/', createUser);
usersRouter.get('/:userId', getUser);
usersRouter.delete('/:userId', deleteUser);

export = usersRouter;
