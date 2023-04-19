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
  goOnline,
  goOffline,
} from '../controllers/user.controller';

const usersRouter = express.Router();

/* User Controller */
usersRouter.post('/', createUser);
usersRouter.get('/', getUsers);
usersRouter.get('/:userId/friends', getFriends);
usersRouter.get('/:userId/emergency-contacts', getEmergencyContacts);
usersRouter.get('/search', searchUsers);
usersRouter.delete('/:userId', deleteUser);
usersRouter.patch('/:userId', updateUser);
usersRouter.patch('/:userId/save-group', saveGroup);
usersRouter.patch('/:userId/delete-saved-group', deleteSavedGroup);
usersRouter.patch('/:userId/accept-group-invitation', acceptGroupInvitation);
usersRouter.patch('/:userId/decline-group-invitation', declineGroupInvitation);
usersRouter.patch('/:userId/leave-group', leaveGroup);
usersRouter.patch('/:userId/request-friend', requestFriend);
usersRouter.patch('/:userId/accept-friend-request', acceptFriendRequest);
usersRouter.patch('/:userId/decline-friend-request', declineFriendRequest);
usersRouter.patch('/:userId/remove-friend-request', removeFriendRequest);
usersRouter.patch('/:userId/remove-friend', removeFriend);
usersRouter.patch('/:userId/add-notification-token', addNotificationToken);
usersRouter.patch('/:userId/remove-notification-token', removeNotificationToken);
usersRouter.patch('/:userId/add-emergency-contact', addEmergencyContact);
usersRouter.patch('/:userId/remove-emergency-contact', removeEmergencyContact);
usersRouter.patch('/:userId/update-emergency-contact', updateEmergencyContact);
usersRouter.patch('/:userId/activate-emergency', activateEmergency);
usersRouter.patch('/:userId/deactivate-emergency', deactivateEmergency);
usersRouter.patch('/:userId/upload-profile-img', uploadProfileImg);
usersRouter.patch('/:userId/goOnline', goOnline);
usersRouter.patch('/:userId/goOffline', goOffline);

export = usersRouter;
