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
  leaveGroup,
  uploadProfileImg,
  addNotificationToken,
  removeNotificationToken,
  removeFriend,
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
usersRouter.patch('/:userId/leaveGroup', leaveGroup);
usersRouter.patch('/:userId/requestFriend', requestFriend);
usersRouter.patch('/:userId/acceptFriendRequest', acceptFriendRequest);
usersRouter.patch('/:userId/declineFriendRequest', declineFriendRequest);
usersRouter.patch('/:userId/removeFriend', removeFriend);
usersRouter.patch('/:userId/addNotificationToken', addNotificationToken);
usersRouter.patch('/:userId/removeNotificationToken', removeNotificationToken);
usersRouter.patch('/:userId/uploadProfileImg', uploadProfileImg);

export = usersRouter;
