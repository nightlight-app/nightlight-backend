import express from 'express';
import {
  createUser,
  getUser,
  deleteUser,
  updateUser,
} from '../controllers/user.controller';

const usersRouter = express.Router();

/* User Controller */
usersRouter.post('/', createUser);
usersRouter.get('/:userId', getUser);
usersRouter.delete('/:userId', deleteUser);
usersRouter.patch('/:userId', updateUser);

export = usersRouter;
