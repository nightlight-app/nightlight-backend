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
  requestFriend,
  acceptFriendRequest,
  declineFriendRequest,
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
usersRouter.patch('/:userId/requestFriend', requestFriend);
usersRouter.patch('/:userId/acceptFriendRequest', acceptFriendRequest);
usersRouter.patch('/:userId/declineFriendRequest', declineFriendRequest);

export = usersRouter;
