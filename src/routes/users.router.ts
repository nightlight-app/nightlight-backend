import express from 'express';
import {
  createUser,
  getUser,
  deleteUser,
  updateUser,
  saveGroup,
  deleteSavedGroup,
  acceptGroupInvitation,
  getFriends,
} from '../controllers/user.controller';

const usersRouter = express.Router();

/* User Controller */
usersRouter.post('/', createUser);
usersRouter.get('/', getUser);
usersRouter.get('/:userId/friends', getFriends);
usersRouter.delete('/:userId', deleteUser);
usersRouter.patch('/:userId', updateUser);
usersRouter.patch('/:userId/saveGroup', saveGroup);
usersRouter.patch('/:userId/deleteSavedGroup', deleteSavedGroup);
usersRouter.patch('/:userId/acceptGroupInvitation', acceptGroupInvitation);

export = usersRouter;
