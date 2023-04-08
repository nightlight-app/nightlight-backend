import express from 'express';
import {
  createUser,
  getUsers,
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
  declineGroupInvitation,
  addEmergencyContact,
  removeEmergencyContact,
  updateEmergencyContact,
  getEmergencyContacts,
  searchUsers,
  removeFriendRequest,
  activateEmergency,
  deactivateEmergency,
} from '../controllers/user.controller';

const usersRouter = express.Router();

/* User Controller */
usersRouter.post('/', createUser);
usersRouter.get('/', getUsers);
usersRouter.get('/:userId/friends', getFriends);
usersRouter.get('/:userId/emergencyContacts', getEmergencyContacts);
usersRouter.get('/search', searchUsers);
usersRouter.delete('/:userId', deleteUser);
usersRouter.patch('/:userId', updateUser);
usersRouter.patch('/:userId/saveGroup', saveGroup);
usersRouter.patch('/:userId/deleteSavedGroup', deleteSavedGroup);
usersRouter.patch('/:userId/acceptGroupInvitation', acceptGroupInvitation);
usersRouter.patch('/:userId/declineGroupInvitation', declineGroupInvitation);
usersRouter.patch('/:userId/leaveGroup', leaveGroup);
usersRouter.patch('/:userId/requestFriend', requestFriend);
usersRouter.patch('/:userId/acceptFriendRequest', acceptFriendRequest);
usersRouter.patch('/:userId/declineFriendRequest', declineFriendRequest);
usersRouter.patch('/:userId/removeFriendRequest', removeFriendRequest);
usersRouter.patch('/:userId/removeFriend', removeFriend);
usersRouter.patch('/:userId/addNotificationToken', addNotificationToken);
usersRouter.patch('/:userId/removeNotificationToken', removeNotificationToken);
usersRouter.patch('/:userId/addEmergencyContact', addEmergencyContact);
usersRouter.patch('/:userId/removeEmergencyContact', removeEmergencyContact);
usersRouter.patch('/:userId/updateEmergencyContact', updateEmergencyContact);
usersRouter.patch('/:userId/activateEmergency', activateEmergency);
usersRouter.patch('/:userId/deactivateEmergency', deactivateEmergency);
usersRouter.patch('/:userId/uploadProfileImg', uploadProfileImg);

export = usersRouter;
