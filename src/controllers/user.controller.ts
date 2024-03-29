import User from '../models/User.model';
import Group from '../models/Group.model';
import { upload } from '../config/cloudinary.config';
import { IMAGE_UPLOAD_OPTIONS } from '../utils/constants';
import { sendNotifications } from '../utils/notification.utils';
import { NotificationType } from '../interfaces/Notification.interface';
import { KeyValidationType, verifyKeys } from '../utils/validation.utils';
import {
  addFriendRequestResponseJob,
  addGroupInviteResponseJob,
} from '../queue/jobs';
import streamifier from 'streamifier';
import { MulterError } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import type { LocationData } from '../interfaces/LastActive.interface';
import type { Request, Response } from 'express';

/**
 * Creates a new user in the database based on the information provided in the request body.
 * @param {Request} req - Express request object containing the user data to be stored.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {User} Returns status code 201 and an object containing success message and user object if user creation is successful. Otherwise, returns an error status with appropriate message.
 */
export const createUser = async (req: Request, res: Response) => {
  const user = req.body;

  if (!user) {
    return res.status(400).send({ message: 'No user data provided!' });
  }

  // Verify that the user object has all the necessary keys
  const validationError = verifyKeys(user, KeyValidationType.USERS);
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  // Create a new user object
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
  const userIds = req.query.userIds as string;
  const firebaseUids = req.query.firebaseUid as string;

  // Determine which query parameter was provided (prefer userId over firebaseUid)
  const queryType = userIds ? '_id' : 'firebaseUid';

  // Create a list of user IDs or firebase UIDs
  let idList;
  if (userIds) idList = userIds.split(',');
  if (firebaseUids) idList = firebaseUids.split(',');

  // Check if the user ID or firebase UID was provided
  if (!idList || idList.length === 0)
    return res
      .status(400)
      .send({ message: 'No user IDs or firebase UIDs provided!' });

  // Check if the user ID or firebase UID was provided
  if (userIds) {
    idList = idList.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
  }

  // Check if the user ID or firebase UID was provided
  if (firebaseUids) {
    idList = idList.filter((id: string) => id.length === 28);
  }

  // Respond with an error if the user ID or firebase UID is invalid
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
    )
      .populate('sentPings')
      .populate('receivedPings')
      .populate('currentGroup')
      .populate('friends');

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
 * Searches for users based on the provided query string and returns a list of users that match the query.
 * Will be replaced in the future using the mongo search indexing features.
 *
 * @param {Request} req - Express request object containing the query parameters, including the query string.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {Object<User[]>} Returns status code 200 and an object containing a success message and list of users that match the query string if successful.
 */
export const searchUsers = async (req: Request, res: Response) => {
  const queryString = req.query.query as string;
  const count = Number(req.query.count as string);
  const page = Number(req.query.page as string);

  // Check if the query string is provided
  if (!count) {
    return res.status(400).send({ message: 'No count provided!' });
  }

  // Check if the query string is provided
  if (!page) {
    return res.status(400).send({ message: 'No page provided!' });
  }

  // Calculate the number of users to skip
  const skip = (page - 1) * count;

  // Check if the query string is provided
  if (queryString === undefined) {
    return res.status(400).send({ message: 'No query string provided!' });
  }

  try {
    let users;

    if (queryString === '') {
      // Select count number of random users from the database and omit the notificationToken from the response
      users = await User.aggregate([
        { $sample: { size: count } },
        { $project: { notificationToken: 0 } },
      ]);
    } else {
      // Find the user in the database and omit the notificationToken from the response
      users = await User.find(
        {
          $or: [
            { firstName: { $regex: '^' + queryString, $options: 'i' } },
            { lastName: { $regex: '^' + queryString, $options: 'i' } },
          ],
        },
        { notificationToken: 0 }
      )
        .skip(skip)
        .limit(count);
    }

    return res
      .status(200)
      .send({ message: 'Successfully found users!', users: users });
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
  const userId = req.params.userId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Delete the user from the database
    const result = await User.deleteOne({ _id: userObjectId });

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
  const userId = req.params.userId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Create an object id from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Find the user in the database and update the user data, omitting the notificationToken from the response
    const targetUser = await User.findByIdAndUpdate(
      { _id: userObjectId },
      req.body,
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
 * Saves a group to the specified user's savedGroups array.
 * @param {Request} req - Express request object containing the userId and the group object to be saved in the user's savedGroups array.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {User} Returns status code 200 and an object containing a success message and updated details of the user, otherwise returns an error status with appropriate message.
 */
export const saveGroup = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const group = req.body;

  // Verify that the user object has all the necessary keys
  const validationError = verifyKeys(group, KeyValidationType.SAVED_GROUPS);
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Find the user in the database and update the user data, omitting the notificationToken from the response
    const targetUser = await User.findByIdAndUpdate(
      userObjectId,
      {
        $push: {
          savedGroups: { ...group, _id: new mongoose.Types.ObjectId() },
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

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the group ID was provided
  if (!savedGroupId) {
    return res.status(400).send({ message: 'No group ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided savedGroupId is valid
  if (!mongoose.Types.ObjectId.isValid(savedGroupId)) {
    return res.status(400).send({ message: 'Invalid saved group ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create a new ObjectId from the savedGroupId
  const savedGroupObjectId = new mongoose.Types.ObjectId(savedGroupId);

  try {
    // Find the user in the database and update the user data, omitting the notificationToken from the response
    const targetUser = await User.findByIdAndUpdate(
      userObjectId,
      {
        $pull: {
          savedGroups: { _id: savedGroupObjectId },
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

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the group ID was provided
  if (!groupId) {
    return res.status(400).send({ message: 'No group ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided groupId is valid
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create a new ObjectId from the groupId
  const groupObjectId = new mongoose.Types.ObjectId(groupId);

  try {
    // Remove groupId from invited groups and add to currentGroup
    const targetUser = await User.findById(userObjectId);

    // Remove userId from invitedMembers in group and add to members in group
    const targetGroup = await Group.findById(groupObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Check if the group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    // Check if the user is already in the group
    if (
      targetGroup.members.includes(userObjectId) &&
      targetUser.currentGroup?.equals(groupObjectId)
    ) {
      return res.status(400).send({ message: 'User is already in this group!' });
    }

    // Check if the user is already in a group
    if (targetUser.currentGroup) {
      return res
        .status(400)
        .send({ message: 'User is already in another group!' });
    }

    // Disallow user from joining group if invitation does not exist
    if (
      !targetUser.receivedGroupInvites.includes(groupObjectId) ||
      !targetGroup.invitedMembers.includes(userObjectId)
    ) {
      return res
        .status(400)
        .send({ message: 'User has not been invited to this group!' });
    }

    // Remove groupId from invited group
    targetUser.receivedGroupInvites = targetUser.receivedGroupInvites.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(groupObjectId)
    );

    // Add groupId to currentGroup
    targetUser.currentGroup = groupObjectId;

    // Remove userId from invitedMembers in group
    targetGroup.invitedMembers = targetGroup.invitedMembers.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
    );

    // Add userId to members in group
    targetGroup.members.push(userObjectId);

    // Save the updated user and group
    await targetUser.save();
    await targetGroup.save();

    // Remove the invite notification from the user's notifications
    await addGroupInviteResponseJob(userId, groupId);

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
      {
        notificationType: NotificationType.groupInviteAccepted,
        sentDateTime: new Date().toUTCString(),
        senderId: userId,
        senderFirstName: targetUser.firstName,
        senderLastName: targetUser.lastName,
        groupId: groupId,
        groupName: targetGroup.name,
      },
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

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the group ID was provided
  if (!groupId) {
    return res.status(400).send({ message: 'No group ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided groupId is valid
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create a new ObjectId from the groupId
  const groupObjectId = new mongoose.Types.ObjectId(groupId);

  try {
    // Remove groupId from invited groups
    const targetGroup = await Group.findById(groupObjectId);

    // Find target user
    const targetUser = await User.findById(userId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Check if the group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    // Disallow user from declining group invitation if invitation does not exist
    if (
      !targetUser.receivedGroupInvites.includes(groupObjectId) ||
      !targetGroup.invitedMembers.includes(userObjectId)
    ) {
      return res
        .status(400)
        .send({ message: 'User has not been invited to this group!' });
    }

    // Remove groupId from invited groups
    targetUser.receivedGroupInvites = targetUser.receivedGroupInvites.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(groupObjectId)
    );

    // Remove userId from invitedMembers in group
    targetGroup.invitedMembers = targetGroup.invitedMembers.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
    );

    // Save the updated user and group
    await targetUser.save();
    await targetGroup.save();

    // Remove the invite notification from the user's notifications
    await addGroupInviteResponseJob(userId, groupId);

    // Send notifications to all invited users that the invitation has been declined
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
      {
        notificationType: NotificationType.groupInviteDeclined,
        sentDateTime: new Date().toUTCString(),
        senderId: userId,
        senderFirstName: targetUser.firstName,
        senderLastName: targetUser.lastName,
        groupId: groupId,
        groupName: targetGroup.name,
      },
      false
    );

    return res.status(200).send({ message: 'Successfully declined invitation!' });
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

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the group ID was provided
  if (!groupId) {
    return res.status(400).send({ message: 'No group ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided groupId is valid
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create a new ObjectId from the groupId
  const groupObjectId = new mongoose.Types.ObjectId(groupId);

  try {
    // Remove userId from members in group
    const targetGroup = await Group.findById(groupObjectId);

    // Find target user
    const targetUser = await User.findById(userObjectId);

    // Check if the group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    /*
     * If there are less than 2 members left in the group, delete the group
     * Else, remove groupId from currentGroup of user
     */
    if (targetGroup.members.length <= 2) {
      // Remove groupId from currentGroup of all members
      await User.updateMany(
        { _id: { $in: targetGroup.members } },
        { currentGroup: undefined, lastActive: undefined }
      );

      // Remove groupId from receivedGroupInvites of all members since the group has been deleted
      await User.updateMany(
        { _id: { $in: targetGroup.invitedMembers } },
        { $pull: { receivedGroupInvites: groupId } }
      );

      // Send notifications to all members that the group has been deleted
      sendNotifications(
        [
          ...targetGroup.members
            .map(objectId => objectId.toString())
            .filter(id => id !== userId),
        ],
        'Group deleted 😢',
        'Your group has been deleted due to lack of members.',
        {
          notificationType: NotificationType.groupDeleted,
          sentDateTime: new Date().toUTCString(),
          senderId: userId,
          senderFirstName: targetUser.firstName,
          senderLastName: targetUser.lastName,
          groupId: groupId,
          groupName: targetGroup.name,
        },
        false
      );

      // Delete the group
      await targetGroup.deleteOne();
    } else {
      // Remove userId from members in group
      targetGroup.members = targetGroup.members.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
      );

      // Remove groupId from currentGroup of user
      targetUser.currentGroup = undefined;

      // Remove lastActive location from user
      targetUser.lastActive = undefined;

      // Check if the user exists
      if (targetUser === null) {
        return res.status(400).send({ message: 'User does not exist!' });
      }

      // Save the updated group
      targetGroup.save();
    }

    // Save the updated user and group
    await targetUser.save();

    return res.status(200).send({ message: 'Successfully left group!' });
  } catch (error: any) {
    console.log(error.message);
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

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Find the user in the database
    const targetUser = await User.findById(userObjectId).populate('friends');

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    return res.status(200).send({
      message: 'Successfully found friends!',
      friends: targetUser.friends,
    });
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

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the friend user ID was provided
  if (!friendId) {
    return res.status(400).send({ message: 'No friend user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided friendId is valid
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create a new ObjectId from the friendId
  const friendObjectId = new mongoose.Types.ObjectId(friendId);

  try {
    // Find the user in the database
    const targetUser = await User.findById(userObjectId);

    // Find the friend in the database
    const targetFriend = await User.findById(friendObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Check if the friend exists
    if (targetFriend === null) {
      return res
        .status(400)
        .send({ message: 'User being requested does not exist!' });
    }

    // Update the user's sentFriendRequests array
    targetUser.sentFriendRequests.push(friendObjectId);

    // Update the friend's receivedFriendRequests array
    targetFriend.receivedFriendRequests.push(userObjectId);

    // Save the updated user and friend to the database
    await targetUser.save();
    await targetFriend.save();

    // Send a notification to the friend that they have received a friend request
    sendNotifications(
      [friendId],
      'New friend request! 👥',
      targetUser.firstName +
        ' ' +
        targetUser.lastName +
        ' has sent you a friend request.',
      {
        notificationType: NotificationType.friendRequest,
        sentDateTime: new Date().toUTCString(),
        senderId: userId,
        senderFirstName: targetUser.firstName,
        senderLastName: targetUser.lastName,
      },
      true
    );

    return res.status(200).send({ message: 'Successfully sent friend request!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Accepts friend request and adds the new friend to user's friends list while removing the request from
 * receivedFriendRequests list. Also adds the user to the friend's friends list and updates the sentFriendRequests list.
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise} Returns success message on successful addition of friend, otherwise returns an error message
 * with corresponding status code.
 */
export const acceptFriendRequest = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const friendId = req.query.friendId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the friend user ID was provided
  if (!friendId) {
    return res.status(400).send({ message: 'No friend user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided friendId is valid
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  // Convert user ID to mongoose ObjectId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Convert friend ID to mongoose ObjectId
  const friendObjectId = new mongoose.Types.ObjectId(friendId);

  try {
    // Find the user in the database and add the friendId to their friend array while removing it from their receivedFriendRequests array
    const targetUser = await User.findById(userObjectId);

    // Find the friend in the database and add the userId to their friend array
    const targetFriendUser = await User.findById(friendObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Check if the friend exists
    if (targetFriendUser === null) {
      return res.status(400).send({ message: 'Friend does not exist!' });
    }

    // Disallow friend acceptance if the invite was not sent or received
    if (
      !targetUser.receivedFriendRequests.includes(friendObjectId) ||
      !targetFriendUser.sentFriendRequests.includes(userObjectId)
    ) {
      return res.status(400).send({ message: 'Friend request not found!' });
    }

    // Add the friendId to the user's friends array
    targetUser.friends.push(friendObjectId);

    // Add the userId to the friend's friends array
    targetFriendUser.friends.push(userObjectId);

    // Remove the friendId from the user's receivedFriendRequests array
    targetUser.receivedFriendRequests = targetUser.receivedFriendRequests.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(friendObjectId)
    );

    // Remove the userId from the friend's sentFriendRequests array
    targetFriendUser.sentFriendRequests =
      targetFriendUser.sentFriendRequests.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
      );

    // Save the updated user and friend to the database
    await targetUser.save();
    await targetFriendUser.save();

    // Remove the invite notification from the user's notifications
    await addFriendRequestResponseJob(userId, friendId);

    // Send a notification to the friend that they have received a friend request
    sendNotifications(
      [friendId],
      'Friend request accepted! 🎉',
      targetUser.firstName +
        ' ' +
        targetUser.lastName +
        ' has accepted your friend request.',
      {
        notificationType: NotificationType.friendRequestAccepted,
        sentDateTime: new Date().toUTCString(),
        senderId: userId,
        senderFirstName: targetUser.firstName,
        senderLastName: targetUser.lastName,
      },
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
 * Declines a friend request for a user by updating both their friends and receivedFriendRequests arrays.
 * Also updates the friend's friends and sentFriendRequests arrays.
 * @param {Request} req - the Request object containing userId in the params and friendId in the query
 * @param {Response} res - the Response object sent back to the client
 * @returns {Promise} Returns either an error response with a 400 or 500 status code and a message,
 * or a success response with a 200 status code and a message
 */
export const declineFriendRequest = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const friendId = req.query.friendId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the friend user ID was provided
  if (!friendId) {
    return res.status(400).send({ message: 'No friend user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided friendId is valid
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  // Convert user ID to mongoose ObjectId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Convert friend ID to mongoose ObjectId
  const friendObjectId = new mongoose.Types.ObjectId(friendId);

  try {
    // Find the friend user in the database
    const targetFriend = await User.findById(friendObjectId);

    // Find the user in the database and remove the friendId from their receivedFriendRequests array
    const targetUser = await User.findById(userObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Check if the friend exists
    if (targetFriend === null) {
      return res.status(400).send({ message: 'User requesting does not exist!' });
    }

    // Disallow friend request decline if the invite was not sent or received
    if (
      !targetUser.receivedFriendRequests.includes(friendObjectId) ||
      !targetFriend.sentFriendRequests.includes(userObjectId)
    ) {
      return res.status(400).send({ message: 'Friend request not found!' });
    }

    // Remove the friendId from the user's receivedFriendRequests array
    targetUser.receivedFriendRequests = targetUser.receivedFriendRequests.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(friendObjectId)
    );

    // Remove the userId from the friend's sentFriendRequests array
    targetFriend.sentFriendRequests = targetFriend.sentFriendRequests.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
    );

    // Save the updated user and friend to the database
    await targetUser.save();
    await targetFriend.save();

    // Remove the invite notification from the user's notifications
    await addFriendRequestResponseJob(userId, friendId);

    // Send a notification to the sender that their friend request was declined
    sendNotifications(
      [friendId],
      'Friend request declined! ❌',
      targetFriend.firstName +
        ' ' +
        targetFriend.lastName +
        ' has declined your friend request.',
      {
        notificationType: NotificationType.friendRequestDeclined,
        sentDateTime: new Date().toUTCString(),
        senderId: userId,
        senderFirstName: targetUser.firstName,
        senderLastName: targetUser.lastName,
      },
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
 * Removes a friend request from a user's sentFriendRequests array and the friend's receivedFriendRequests array.
 * @param {Request} req - the Request object containing userId in the params and friendId in the query
 * @param {Response} res - the Response object sent back to the client
 * @returns {Promise} Returns either an error response with a 400 or 500 status code and a message,
 * or a success response with a 200 status code and a message
 */
export const removeFriendRequest = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const friendId = req.query.friendId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the friend user ID was provided
  if (!friendId) {
    return res.status(400).send({ message: 'No friend user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided friendId is valid
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create a new ObjectId from the friendId
  const friendObjectId = new mongoose.Types.ObjectId(friendId);

  try {
    // Find the user in the database and remove the friendId from their receivedFriendRequests array
    const targetUser = await User.findById(userObjectId);

    // Find the friend user in the database
    const targetFriend = await User.findById(friendObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Check if the friend exists
    if (targetFriend === null) {
      return res.status(400).send({ message: 'User requesting does not exist!' });
    }

    // Disallow friend request removal if the invite was not sent or received
    if (
      !targetUser.sentFriendRequests.includes(friendObjectId) ||
      !targetFriend.receivedFriendRequests.includes(userObjectId)
    ) {
      return res.status(400).send({ message: 'Friend request not found!' });
    }

    // Remove the friendId from the user's receivedFriendRequests array
    targetUser.sentFriendRequests = targetUser.sentFriendRequests.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(friendObjectId)
    );

    // Remove the userId from the friend's sentFriendRequests array
    targetFriend.receivedFriendRequests =
      targetFriend.receivedFriendRequests.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
      );

    // Save the updated user and friend to the database
    await targetUser.save();
    await targetFriend.save();

    // Remove the invite notification from the friend user's notifications
    await addFriendRequestResponseJob(friendId, userId);

    res.status(200).send({ message: 'Successfully removed friend request!' });
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

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the friend user ID was provided
  if (!friendId) {
    return res.status(400).send({ message: 'No friend user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the provided friendId is valid
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create a new ObjectId from the friendId
  const friendObjectId = new mongoose.Types.ObjectId(friendId);

  try {
    // Find the user in the database
    const targetUser = await User.findByIdAndUpdate(userObjectId);

    // Find the friend in the database
    const targetFriendUser = await User.findById(friendObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Check if the friend exists
    if (targetFriendUser === null) {
      return res.status(400).send({ message: 'Friend does not exist!' });
    }

    // Remove the friendId from the user's friends array
    targetUser.friends = targetUser.friends.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(friendObjectId)
    );

    // Remove the userId from the friend's friends array
    targetFriendUser.friends = targetFriendUser.friends.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
    );

    // Save the updated user and friend to the database
    await targetUser.save();
    await targetFriendUser.save();

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

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

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

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Find the user in the database and add the notification token to their account
    await User.findByIdAndUpdate(userObjectId, {
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

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Find the user in the database and remove the notification token from their account
    await User.findByIdAndUpdate(userObjectId, {
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

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Check if the emergency contact ID is valid
    const targetUser = await User.findById(userObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Check if the emergency contact already exists
    if (
      targetUser.emergencyContacts.some(
        contact => contact.phone === emergencyContact.phone
      )
    ) {
      return res.status(400).send({
        message: 'Emergency contact already exists!',
      });
    }

    // Generate a new ID for the emergency contact
    const generatedId = new mongoose.Types.ObjectId();

    // Add the emergency contact to the user's account
    targetUser.emergencyContacts.push({
      ...emergencyContact,
      _id: generatedId,
    });

    // Save the updated user to the database
    await targetUser.save();

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
    return res.status(400).send({ message: 'No emergency contact ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the emergency contact is valid
  if (!mongoose.Types.ObjectId.isValid(emergencyContactId)) {
    return res.status(400).send({ message: 'Invalid emergency contact ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create a new ObjectId from the emergency contact ID
  const emergencyContactObjectId = new mongoose.Types.ObjectId(
    emergencyContactId
  );

  try {
    // Find the user in the database and remove the emergency contact from their account
    const targetUser = await User.findById(userObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Remove the emergency contact from the user's emergency contacts array
    targetUser.emergencyContacts = targetUser.emergencyContacts.filter(
      (contact: any) => !contact._id.equals(emergencyContactObjectId)
    );

    // Save the updated user to the database
    await targetUser.save();

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
    return res.status(400).send({ message: 'No emergency contact ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the emergency contact is valid
  if (!mongoose.Types.ObjectId.isValid(emergencyContactId)) {
    return res.status(400).send({ message: 'Invalid emergency contact ID!' });
  }

  // Check if the emergency contact is valid
  const validationError = verifyKeys(
    emergencyContact,
    KeyValidationType.EMERGENCY_CONTACTS
  );

  // Check if the validation error is not empty and return the error
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  // Create a new ObjectId from the emergency contact ID
  const emergencyContactObjectId = new mongoose.Types.ObjectId(
    emergencyContactId
  );

  // Add the emergency contact ID to the emergency contact object
  const updatedEmergencyContact = {
    ...emergencyContact,
    _id: emergencyContactObjectId,
  };

  try {
    // Find and update the emergency contact in the database
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

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Find the user in the database
    const targetUser = await User.findById(userObjectId);

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
 * Activates the emergency for the specified user in their current group.
 * This sets the "isEmergency" property to true for a specific user,
 * sends notifications to all users in the group (excluding the user who activated the emergency),
 * and send an SMS to all emergency contacts (TODO).
 *
 * @param {Request} req - The HTTP request object containing the user ID in the params.
 * @param {Response} res - The HTTP response object used to send a status code and message.
 * @returns {Promise} A Promise object representing the completion of the activation process.
 */
export const activateEmergency = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Find the user in the database
    const targetUser = await User.findById(userObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Change the user document so that "isEmergency" is true
    targetUser.isEmergency = true;

    // If the user is in a group, send notifications to all users in the group
    if (targetUser.currentGroup) {
      const targetGroup = await Group.findById(targetUser.currentGroup);

      // Check if the group exists
      if (targetGroup === null) {
        return res.status(400).send({ message: 'Group does not exist!' });
      }

      // send notifications to users in group
      sendNotifications(
        [
          ...targetGroup.members
            .map(objectId => objectId.toString())
            // exclude the user who activated the emergency
            .filter(id => id !== userId),
        ],
        '🚨 Emergency! 🚨',
        targetUser.firstName +
          ' ' +
          targetUser.lastName +
          ' has activated an emergency‼️',
        {
          notificationType: NotificationType.activateEmergency,
          sentDateTime: new Date().toUTCString(),
          senderId: userId,
          senderFirstName: targetUser.firstName,
          senderLastName: targetUser.lastName,
          groupId: targetGroup._id.toString(),
        },
        true
      );
    }

    // Save the updated user to the database
    await targetUser.save();

    // TODO LATER: send an SMS to all emergency contacts

    return res.status(200).send({ message: 'Successfully activated emergency!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Deactivates the emergency for the specified user in their current group.
 * This sets the "isEmergency" property to false for a specific user,
 * sends notifications to all users in the group (excluding the user who deactivated the emergency),
 * and send an SMS to all emergency contacts (TODO).
 *
 * @param {Request} req - The HTTP request object containing the user ID in the params.
 * @param {Response} res - The HTTP response object used to send a status code and message.
 * @returns {Promise} A Promise object representing the completion of the deactivation process.
 */
export const deactivateEmergency = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Find the user in the database
    const targetUser = await User.findById(userObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Change the user document so that "isEmergency" is false
    targetUser.isEmergency = false;

    // If the user is in a group, send notifications to all users in the group
    if (targetUser.currentGroup) {
      const targetGroup = await Group.findById(targetUser.currentGroup);

      // Check if the group exists
      if (targetGroup === null) {
        return res.status(400).send({ message: 'Group does not exist!' });
      }

      // send notifications to users in group
      sendNotifications(
        [
          ...targetGroup.members
            .map(objectId => objectId.toString())
            // exclude the user who deactivated the emergency
            .filter(id => id !== userId),
        ],
        'Emergency deactivated ✅',
        targetUser.firstName +
          ' ' +
          targetUser.lastName +
          ' has deactivated the emergency.',
        {
          notificationType: NotificationType.deactivateEmergency,
          sentDateTime: new Date().toUTCString(),
          senderId: userId,
          senderFirstName: targetUser.firstName,
          senderLastName: targetUser.lastName,
          groupId: targetGroup._id.toString(),
        },
        true
      );
    }

    // Save the updated user to the database
    await targetUser.save();

    // TODO LATER: send an SMS to all emergency contacts

    return res.status(200).send({ message: 'Successfully activated emergency!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Activates the "isActiveNow" status for the specified user in their current group.
 *
 * @param {Request} req - The HTTP request object containing the user ID in the params.
 * @param {Response} res - The HTTP response object used to send a status code and message.
 * @returns {Promise} A Promise object representing the completion of setting the user to online.
 */
export const goOnline = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Find the user in the database
    const targetUser = await User.findByIdAndUpdate(userObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Change the user document so that "isActiveNow" is true
    targetUser.isActiveNow = true;

    // Save the updated user to the database
    await targetUser.save();

    return res.status(200).send({ message: 'Successfully went online!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Deactivates the "isActiveNow" status for the specified user in their current group
 * and updates the user's last location.
 *
 * @param {Request} req - The HTTP request object containing the user ID in the params.
 * @param {Response} res - The HTTP response object used to send a status code and message.
 * @returns {Promise} A Promise object representing the completion of setting the user to offline.
 */
export const goOffline = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const location = req.body.location as LocationData;

  // check if the location object was provided
  if (!location) {
    return res.status(400).send({ message: 'No location provided!' });
  }

  // Verify that the user object has all the necessary keys
  const validationError = verifyKeys(location, KeyValidationType.LOCATIONS);
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the provided userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Create a new ObjectId from the userId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create a new lastActive object with the provided location
  const lastActive = { ...req.body, time: new Date().toUTCString() };

  try {
    // Find and update the user in the database
    const targetUser = await User.findById(userObjectId);

    // Check if the user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Change the user document so that "isActiveNow" is false
    targetUser.isActiveNow = false;

    // Change the user document so that "lastActive" is the provided location
    targetUser.lastActive = lastActive;

    // Save the updated user to the database
    await targetUser.save();

    return res.status(200).send({ message: 'Successfully went offline!' });
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

    const userId = req.params.userId as string;
    const image = req.file;

    // Check if the user ID was provided
    if (!userId) {
      return res.status(400).send({ message: 'No user ID provided!' });
    }

    // Check if the provided userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    // Check if the image was provided
    if (!image) {
      return res.status(400).send({ message: 'No image provided!' });
    }

    // Create a new ObjectId from the userId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    try {
      const targetUser = await User.findById(userObjectId);

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
