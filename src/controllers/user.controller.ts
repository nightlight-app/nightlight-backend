import { Request, Response } from 'express';
import User from '../models/User.model';
import mongoose from 'mongoose';
import Group from '../models/Group.model';
import { v2 as cloudinary } from 'cloudinary';
import { upload } from '../config/cloudinary.config';
import { MulterError } from 'multer';
import streamifier from 'streamifier';
import { IMAGE_UPLOAD_OPTIONS } from '../utils/constants';
import { sendNotifications } from '../utils/notification.utils';
import { NotificationType } from '../interfaces/Notification.interface';
import { KeyValidationType, verifyKeys } from '../utils/validation.utils';

/**
 * Creates a new user in the database based on the information provided in the request body.
 * @param {Request} req - Express request object containing the user data to be stored.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {User} Returns status code 201 and an object containing success message and user object if user creation is successful. Otherwise, returns an error status with appropriate message.
 */
export const createUser = async (req: Request, res: Response) => {
  const user = req.body;

  const validationError = verifyKeys(user, KeyValidationType.USERS);
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  const newUser = new User(user);

  try {
    // add the user to the database
    await newUser.save();

    // remove the notificationToken from the response
    newUser.notificationToken = undefined;

    // create a notification to be sent to the user and remove the notificationToken from the response
    return res.status(201).send({
      message: 'Successfully created user!',
      user: newUser,
    });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Retrieves a list of users' data based on their userIds or firebaseUids and returns it as a list of objects.
 * @param {Request} req - Express request object containing the query parameters, including the userId or firebaseUid.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {Object[]} Returns status code 200 and an object containing a success message and list of targetUsers objects if successful.
 * Otherwise, returns an error status with an appropriate message.
 */
export const getUsers = async (req: Request, res: Response) => {
  const userIds = req.query.userId as string;
  const firebaseUids = req.query.firebaseUid as string;

  // Determine which query parameter was provided (prefer userId over firebaseUid)
  const queryType = userIds ? '_id' : 'firebaseUid';

  let idList;
  if (userIds) idList = userIds.split(',');
  if (firebaseUids) idList = firebaseUids.split(',');

  if (!idList)
    return res
      .status(400)
      .send({ message: 'No user IDs or firebase UIDs provided!' });

  if (userIds) {
    idList = idList.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
  }

  if (firebaseUids) {
    idList = idList.filter((id: string) => id.length === 28);
  }

  if (idList.length === 0)
    return res
      .status(400)
      .send({ message: 'Invalid user IDs or firebase UIDs provided!' });

  try {
    // Find the user in the database and omit the notificationToken from the response
    const targetUsers = await User.find(
      {
        [queryType]: idList,
      },
      { notificationToken: 0 }
    );

    // Check if the user exists
    if (targetUsers.length === 0 || !targetUsers) {
      return res.status(400).send({ message: 'User(s) does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully found user!', users: targetUsers });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Deletes a user matching the provided userId parameter from the database.
 * @param {Request} req - Express request object containing the parameters, including the userId.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {Object} Returns status code 200 and a success message if the user was deleted successfully. Otherwise, returns an error status with an appropriate message.
 */
export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params?.userId;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  try {
    // Delete the user from the database
    const result = await User.deleteOne({ _id: userId });

    // Check if the user was deleted
    if (result.deletedCount === 0) {
      return res.status(400).send({ message: 'User not found!' });
    }

    return res.status(200).send({ message: 'Successfully deleted user!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Updates an existing user document in the database.
 * @param {Request} req - Express request object containing the parameters, including the userId and updated user data as body.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {User} Returns status code 200 and an object containing a success message and the updated user object if successful.
 * Otherwise, returns an error status with an appropriate message.
 */
export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params?.userId;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  try {
    // Find the user in the database and update the user data, omitting the notificationToken from the response
    const targetUser = await User.findByIdAndUpdate({ _id: userId }, req.body, {
      new: true,
      select: '-notificationToken',
    });

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully updated user!', user: targetUser });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Saves a group to the specified user's savedGroups array.
 * @param {Request} req - Express request object containing the userId and the group object to be saved in the user's savedGroups array.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {User} Returns status code 200 and an object containing a success message and updated details of the user, otherwise returns an error status with appropriate message.
 */
export const saveGroup = async (req: Request, res: Response) => {
  const userId = req.params?.userId;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  try {
    // Find the user in the database and update the user data, omitting the notificationToken from the response
    const targetUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          savedGroups: { ...req.body, _id: new mongoose.Types.ObjectId() },
        },
      },
      { new: true, select: '-notificationToken' }
    );

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }
    return res
      .status(200)
      .send({ message: 'Successfully updated user!', user: targetUser });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Deletes a saved group from a user's list of saved groups
 * @param {Request} req - the request object containing user and saved group IDs
 * @param {Response} res - the response object
 * @returns {Promise} - a promise that resolves to a response object
 * indicating whether the saved group was successfully deleted or the error that occurred
 */
export const deleteSavedGroup = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const savedGroupId = req.query.savedGroupId as string;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided savedGroupId is valid
  if (!mongoose.Types.ObjectId.isValid(savedGroupId)) {
    return res.status(400).send({ message: 'Invalid saved group ID!' });
  }

  try {
    // Find the user in the database and update the user data, omitting the notificationToken from the response
    const targetUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $pull: {
          savedGroups: { _id: savedGroupId },
        },
      },
      {
        new: true,
        select: '-notificationToken',
      }
    );

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }
    return res
      .status(200)
      .send({ message: 'Successfully updated user!', user: targetUser });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * API endpoint for accepting a group invitation for a user.
 * @param {Request} req - The request object containing the userId and groupId to accept.
 * @param {Response} res - The response object sent back with a success or error message.
 * @returns {Promise} Returns a Promise containing the response after updating the database.
 */
export const acceptGroupInvitation = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const groupId = req.query.groupId as string;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided groupId is valid
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  try {
    // Remove groupId from invited groups and add to currentGroup
    const targetUser = await User.findByIdAndUpdate(userId, {
      $pull: { invitedGroups: groupId },
      currentGroup: groupId,
    });

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Remove userId from invitedMembers in group and add to members in group
    const targetGroup = await Group.findByIdAndUpdate(groupId, {
      $pull: { invitedMembers: userId },
      $push: { members: userId },
    });

    // Check if the group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    // send notifications to all invited users that they have been invited to the group
    sendNotifications(
      [
        ...targetGroup.members
          .map(objectId => objectId.toString())
          .filter(id => id !== userId),
      ],
      'New group member! 😎',
      targetUser.firstName +
        ' ' +
        targetUser.lastName +
        ' has joined your group.',
      { notificationType: NotificationType.groupInviteAccepted },
      true
    );

    return res
      .status(200)
      .send({ message: 'Successfully accepted invitation to group!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const declineGroupInvitation = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const groupId = req.query.groupId as string;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided groupId is valid
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  try {
    // Remove groupId from invited groups
    const targetGroup = await Group.findByIdAndUpdate(groupId, {
      $pull: { invitedMembers: userId },
    });

    // Check if the group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    // Find target user
    const targetUser = await User.findById(userId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    sendNotifications(
      [
        ...targetGroup.members
          .map(objectId => objectId.toString())
          .filter(id => id !== userId),
      ],
      'Group invitation declined 😢',
      targetUser.firstName +
        ' ' +
        targetUser.lastName +
        ' rejected invitation to group.',
      { notificationType: NotificationType.groupInviteDeclined },
      false
    );

    return res
      .status(200)
      .send({ message: 'Successfully declined invitation!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * An async function that enables a user to leave a group they are currently in
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Response} - A JSON response indicating success or failure or error message with a 500 status code.
 */
export const leaveGroup = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const groupId = req.query.groupId as string;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided groupId is valid
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  try {
    // Remove userId from members in group
    const targetGroup = await Group.findByIdAndUpdate(groupId, {
      $pull: { members: userId },
    });

    // Check if the group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    // Remove groupId from currentGroup of user
    const targetUser = await User.findByIdAndUpdate(userId, {
      currentGroup: undefined,
    });

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    return res.status(200).send({ message: 'Successfully left group!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Retrieves a user's friends based on their userId and returns them as an array of User objects.
 * @param {Request} req - Express request object containing the parameters, including the userId.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {User[]} Returns status code 200 and an object containing a success message and an array of friendUser objects if successful. Otherwise, returns an error status with an appropriate message.
 */
export const getFriends = async (req: Request, res: Response) => {
  const userId = req.params?.userId as string;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  try {
    // Find the user in the database
    const targetUser = await User.findById(userId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Find the friends of the user and omit their notificationTokens
    const targetFriends = await User.find(
      {
        _id: { $in: targetUser?.friends },
      },
      { notificationToken: 0 }
    );

    // Check if the friends exist
    if (targetFriends === null) {
      return res.status(400).send({ message: 'A friend does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully found friends!', friends: targetFriends });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Sends a request to add a friend for the user with the specified userId.
 * @param {Request} req - Express request object containing parameters: userId and friendId.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {Promise} Returns status code 200. Otherwise, returns an error status with an appropriate message.
 */
export const requestFriend = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const friendId = req.query.friendId as string;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided friendId is valid
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  try {
    // Find the user in the database
    const targetUser = await User.findById(userId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Find the friend in the database and add the userId to their friendRequests
    const targetFriend = await User.findByIdAndUpdate(friendId, {
      $push: { friendRequests: userId },
    });

    // Check if the friend exists
    if (targetFriend === null) {
      return res
        .status(400)
        .send({ message: 'User being requested does not exist!' });
    }

    // Send a notification to the friend that they have received a friend request
    sendNotifications(
      [friendId],
      'New friend request! 👥',
      targetUser.firstName +
        ' ' +
        targetUser.lastName +
        ' has sent you a friend request.',
      { notificationType: NotificationType.friendRequest },
      true
    );

    return res
      .status(200)
      .send({ message: 'Successfully sent friend request!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Accepts friend request and adds the new friend to user's friends list while removing the request from
 * friendRequests list.
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise} Returns success message on successful addition of friend, otherwise returns an error message
 * with corresponding status code.
 */
export const acceptFriendRequest = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const friendId = req.query.friendId as string;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided friendId is valid
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  try {
    // Find the user in the database and add the friendId to their friend array while removing it from their friendRequests array
    const targetUser = await User.findByIdAndUpdate(userId, {
      $push: { friends: friendId },
      $pull: { friendRequests: friendId },
    });

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Find the friend in the database and add the userId to their friend array
    const targetFriendUser = await User.findByIdAndUpdate(friendId, {
      $push: { friends: userId },
    });

    // Check if the friend exists
    if (targetFriendUser === null) {
      return res.status(400).send({ message: 'Friend does not exist!' });
    }

    sendNotifications(
      [friendId],
      'Friend request accepted! 🎉',
      targetUser.firstName +
        ' ' +
        targetUser.lastName +
        ' has accepted your friend request.',
      { notificationType: NotificationType.friendRequestAccepted },
      false
    );

    return res
      .status(200)
      .send({ message: 'Successfully accepted friend request!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Accepts a friend request for a user by updating both their friends and friendRequests arrays.
 * @param {Request} req - the Request object containing userId in the params and friendId in the query
 * @param {Response} res - the Response object sent back to the client
 * @returns {Promise} Returns either an error response with a 400 or 500 status code and a message,
 * or a success response with a 200 status code and a message
 */
export const declineFriendRequest = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const friendId = req.query.friendId as string;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided friendId is valid
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  try {
    // Find the friend user in the database
    const targetFriend = await User.findById(friendId);

    // Check if the friend exists
    if (targetFriend === null) {
      return res
        .status(400)
        .send({ message: 'User requesting does not exist!' });
    }

    // Find the user in the database and remove the friendId from their friendRequests array
    const targetUser = await User.findByIdAndUpdate(userId, {
      $pull: { friendRequests: friendId },
    });

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    sendNotifications(
      [friendId],
      'Friend request declined! ❌',
      targetFriend.firstName +
        ' ' +
        targetFriend.lastName +
        ' has declined your friend request.',
      { notificationType: NotificationType.friendRequestDeclined },
      false
    );

    return res
      .status(200)
      .send({ message: 'Successfully declined friend request!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Removes a friend from a user's friend list.
 * @param {Request} req - The HTTP request object containing the user ID and friend ID to remove.
 * @param {Response} res - The HTTP response object used to send status messages back to the client.
 * @returns {Promise} The response object containing either a success or error message.
 */
export const removeFriend = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const friendId = req.query.friendId as string;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided friendId is valid
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  try {
    const targetUser = await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Find the friend in the database and add the userId to their friend array
    const targetFriendUser = await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    // Check if the friend exists
    if (targetFriendUser === null) {
      return res.status(400).send({ message: 'Friend does not exist!' });
    }

    return res.status(200).send({ message: 'Successfully removed friend!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Adds a new notification token to the user's account.
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object.
 * @return {Promise} A promise that resolves to the updated user object.
 */
export const addNotificationToken = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const notificationToken = req.body.notificationToken as string;

  // Check if the notification token was provided
  if (!notificationToken) {
    return res.status(400).send({ message: 'No notification token provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the notification token is valid
  if (!notificationToken.match(/^ExponentPushToken\[[a-zA-Z0-9]+\]$/)) {
    return res.status(400).send({ message: 'Invalid notification token!' });
  }

  try {
    // Find the user in the database and add the notification token to their account
    await User.findByIdAndUpdate(userId, {
      notificationToken: notificationToken,
    });

    return res.status(200).send({ message: 'Successfully added token!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Removes notification token to the user's account.
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object.
 * @return {Promise} A promise that resolves to the updated user object.
 */
export const removeNotificationToken = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  try {
    // Find the user in the database and remove the notification token from their account
    await User.findByIdAndUpdate(userId, {
      notificationToken: undefined,
    });

    return res.status(200).send({ message: 'Successfully removed token!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Adds an emergency contact to a given user's list of contacts.
 *
 * @param {Request} req - The Express request object containing the user ID and contact information.
 * @param {Response} res - The Express response object to modify with success or error messages.
 * @returns {Promise} A Promise that resolves when the contact has been added or rejects with an error.
 */
export const addEmergencyContact = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const emergencyContact = req.body;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .send({ message: 'Invalid user ID! UserId: ' + userId });
  }

  // Check if the emergency contact is valid
  const validationError = verifyKeys(
    emergencyContact,
    KeyValidationType.EMERGENCY_CONTACTS
  );
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  // Check if the emergency contact ID is valid
  const targetUser = await User.findById(userId);

  // Check if the user exists
  if (targetUser === null) {
    return res.status(400).send({
      message: 'User does not exist!',
    });
  }

  // Check if the emergency contact already exists
  const duplicateExists = targetUser.emergencyContacts.some(
    contact => contact.phone === emergencyContact.phone
  );

  // Check if the emergency contact already exists
  if (duplicateExists) {
    return res.status(400).send({
      message: 'Emergency contact already exists!',
    });
  }

  // Generate a new ID for the emergency contact
  const generatedId = new mongoose.Types.ObjectId();

  try {
    // Find the user in the database and add the emergency contact to their account
    const targetUpdatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          emergencyContacts: { ...emergencyContact, _id: generatedId },
        },
      },
      { new: true }
    );

    // Check if the user exists
    if (targetUpdatedUser === null) {
      return res.status(400).send({
        message: 'User does not exist!',
      });
    }

    return res.status(200).send({
      message: 'Successfully added emergency contact!',
      emergencyContact: { ...emergencyContact, _id: generatedId },
    });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Removes an emergency contact to a given user's list of contacts.
 *
 * @param {Request} req - The Express request object containing the user ID and contact information.
 * @param {Response} res - The Express response object to modify with success or error messages.
 * @returns {Promise} A Promise that resolves when the contact has been removed or rejects with an error.
 */
export const removeEmergencyContact = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const emergencyContactId = req.query.emergencyContactId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the emergency contact ID was provided
  if (!emergencyContactId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the emergency contact is valid
  if (!mongoose.Types.ObjectId.isValid(emergencyContactId)) {
    return res.status(400).send({ message: 'Invalid emergency contact ID!' });
  }

  try {
    // Find the user in the database and remove the emergency contact from their account
    const targetUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $pull: { emergencyContacts: { _id: emergencyContactId } },
      },
      { new: true }
    );

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully added emergency contact!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Updates an emergency contact to a given user's list of contacts.
 *
 * @param {Request} req - The Express request object containing the user ID and contact information.
 * @param {Response} res - The Express response object to modify with success or error messages.
 * @returns {Promise} A Promise that resolves when the contact has been updated or rejects with an error.
 */
export const updateEmergencyContact = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const emergencyContactId = req.query.emergencyContactId as string;
  const emergencyContact = req.body;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the emergency contact ID was provided
  if (!emergencyContactId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the emergency contact is valid
  const validationError = verifyKeys(
    emergencyContact,
    KeyValidationType.EMERGENCY_CONTACTS
  );
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  // Add the emergency contact ID to the emergency contact object
  const updatedEmergencyContact = {
    ...emergencyContact,
    _id: emergencyContactId,
  };

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the emergency contact is valid
  if (!mongoose.Types.ObjectId.isValid(emergencyContactId)) {
    return res.status(400).send({ message: 'Invalid emergency contact ID!' });
  }

  try {
    const targetUser = await User.findOneAndUpdate(
      { _id: userId, 'emergencyContacts._id': emergencyContactId },
      { $set: { 'emergencyContacts.$': updatedEmergencyContact } },
      { new: true }
    );

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    return res.status(200).send({
      message: 'Successfully added emergency contact!',
      targetUser: targetUser,
    });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Retrieves the emergency contacts associated with a given user ID.
 *
 * @param {Request} req - The request object containing the user ID as a parameter.
 * @param {Response} res - The response object to be sent back containing the emergency contacts associated with the provided user ID.
 * @returns {Promise} Returns a Promise that resolves when the emergency contacts have been successfully retrieved and sent in the response object.
 */
export const getEmergencyContacts = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  try {
    // Find the user in the database
    const targetUser = await User.findById(userId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Check if the user has any emergency contacts
    return res.status(200).send({
      message: 'Successfully found emergency contacts!',
      emergencyContacts: targetUser.emergencyContacts,
    });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Uploads a profile image for the user with the specified userId to cloudinary
 * and updates the user's field to point to the new image.
 *
 * @param req - the Request object containing the userId in the params and the image in the body
 * @param res - the Response object sent back to the client
 * @returns Returns either an error response with a 400 or 500 status code and a message,
 * or a success response with a 200 status code and a message
 */
export const uploadProfileImg = async (req: Request, res: Response) => {
  // pass everything to multer upload so we can retrieve the image from req.file
  upload(req, res, async err => {
    if (err instanceof MulterError || err) {
      throw new Error(err);
    }

    const userId = req.params?.userId;
    const image = req.file;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    if (!image) {
      return res.status(400).send({ message: 'No image provided!' });
    }

    try {
      const targetUser = await User.findById(userId);

      if (targetUser === null) {
        return res.status(400).send({ message: 'User does not exist!' });
      }

      // transform image to 128x128 and 256x256 and upload to cloudinary
      IMAGE_UPLOAD_OPTIONS.forEach(option => {
        // use streamifier to convert buffer to stream
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            // the public id of the image
            public_id: `${userId}-${option.dimension}`,
            // the folder in cloudinary to upload to
            folder: 'profile-images',
            // overwrite the image if it already exists
            overwrite: true,
            // the transformation to apply to the image
            transformation: [
              {
                width: option.width,
                height: option.height,
              },
            ],
          },
          async (err, result) => {
            if (err) console.log(err);
            if (result) {
              // save the image url to the user's profile
              await User.findByIdAndUpdate(userId, {
                [option.userField]: result.url,
              });
            }
          }
        );
        // pipe the buffer to the upload stream and send the response
        streamifier.createReadStream(image.buffer).pipe(uploadStream);
      });

      return res.status(200).send({ message: 'Successfully uploaded image!' });
    } catch (error: any) {
      console.error('[Cloudinary] Error uploading image: ', error);
      return res.status(500).send({ message: error?.message });
    }
  });
};
