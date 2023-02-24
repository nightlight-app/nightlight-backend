import express from 'express';
import {
  createUser,
  getUser,
  deleteUser,
  updateUser,
  saveGroup,
} from '../controllers/user.controller';

const usersRouter = express.Router();

/* User Controller */
usersRouter.post('/', createUser);
usersRouter.get('/', getUser);
usersRouter.delete('/:userId', deleteUser);
usersRouter.patch('/:userId', updateUser);
usersRouter.patch('/:userId/saveGroup', saveGroup);

export = usersRouter;
