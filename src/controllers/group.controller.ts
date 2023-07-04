import { NotificationType } from '../interfaces/Notification.interface';
import Group from '../models/Group.model';
import User from '../models/User.model';
import { addGroupExpireJob } from '../queue/jobs';
import { sendNotifications } from '../utils/notification.utils';
import { KeyValidationType, verifyKeys } from '../utils/validation.utils';
import { GROUP_EXPIRY_DURATION } from '../utils/constants';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';

/**
 * Creates a new group and adds it to the database.
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding a status and message.
 * @return {Promise} - A promise that resolves when the group has been created or failed to create
 */
export const createGroup = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const group = req.body;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // check if user id is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if the group was provided
  const validationError = verifyKeys(group, KeyValidationType.GROUPS);
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  // create a new group from the request body
  const newGroup = new Group(group);

  // Check if the group has any invited members
  if (newGroup.invitedMembers.length === 0) {
    return res
      .status(400)
      .send({ message: 'Group must have at least one invited member!' });
  }

  // Create an ObjectId from the user ID
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // retrieve user creating the group
    const targetUser = await User.findById(userObjectId);

    // check if user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // check if user is already in a group
    if (targetUser.currentGroup !== undefined) {
      return res.status(400).send({
        message: 'Group cannot be created. User is already in an active group!',
      });
    }

    // add the group id to the user's currentGroup field
    targetUser.currentGroup = newGroup._id;

    // invite all users in the invitedMembers array to the group
    await User.updateMany(
      { _id: { $in: newGroup.invitedMembers } },
      { $push: { receivedGroupInvites: newGroup._id } }
    );

    // save the user to the database with the new group id
    await targetUser.save();

    // save the new group to the database
    await newGroup.save();

    // add the group to the expire queue
    addGroupExpireJob(newGroup._id.toString(), GROUP_EXPIRY_DURATION);

    // send notifications to all invited users that they have been invited to the group
    sendNotifications(
      [...newGroup.invitedMembers.map(id => id.toString())],
      'New group invite! 🎉',
      targetUser.firstName +
        ' ' +
        targetUser.lastName +
        ' has invited you to join their group.',
      {
        notificationType: NotificationType.groupInvite,
        sentDateTime: new Date().toUTCString(),
        senderId: userId,
        senderFirstName: targetUser.firstName,
        senderLastName: targetUser.lastName,
        groupId: newGroup._id.toString(),
        groupName: newGroup.name,
      },
      true
    );

    return res
      .status(200)
      .send({ message: 'Successfully created group!', group: newGroup });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Retrieves a group from the database.
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding the returned group and message.
 * @return {Promise} - A promise that resolves when the group has been created or failed to create
 * @return {Group} - The group that was retrieved
 */
export const getGroup = async (req: Request, res: Response) => {
  const groupId = req.query.groupId as string;

  // Check if the group ID was provided
  if (!groupId) {
    return res.status(400).send({ message: 'No group ID provided!' });
  }

  // check if group id is valid
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  // Create an ObjectId from the group ID
  const groupObjectId = new mongoose.Types.ObjectId(groupId);

  try {
    // retrieve group from database
    const targetGroup = await Group.findById(groupObjectId);

    // check if group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully retrieved group!', group: targetGroup });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Removes a group from the database.
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding a status and message.
 * @return {Promise} - A promise that resolves when the group has been deleted or failed to delete
 */
export const deleteGroup = async (req: Request, res: Response) => {
  const groupId = req.params.groupId as string;

  // Check if the group ID was provided
  if (!groupId) {
    return res.status(400).send({ message: 'No group ID provided!' });
  }

  // check if group id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params?.groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  // Create an ObjectId from the group ID
  const groupObjectId = new mongoose.Types.ObjectId(groupId);

  try {
    // Find group to delete
    const targetGroup = await Group.findById(groupObjectId);

    // Check if group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    // Remove currentGroup and lastActive from all users in the group
    await User.updateMany(
      { _id: { $in: targetGroup.members } },
      { currentGroup: undefined, lastActive: undefined }
    );

    // Remove the group from the database
    await targetGroup.remove();

    // Send notification to members that group has been deleted
    sendNotifications(
      [...targetGroup.members.map(id => id.toString())],
      'Group deleted! 😢',
      'Your group has been deleted.',
      {
        notificationType: NotificationType.groupDeleted,
        sentDateTime: new Date().toUTCString(),
        groupId: targetGroup._id.toString(),
        groupName: targetGroup.name,
      },
      true
    );

    return res.status(200).send({ message: 'Successfully deleted group!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Invites one or more members to an existing group by its ID, and sends a response.
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding a status and message.
 * @return {Promise} - A promise that resolves when the the members have been invited or failed to invite
 */
export const inviteMembersToExistingGroup = async (
  req: Request,
  res: Response
) => {
  const users = req.body.users as string[];
  const groupId = req.params.groupId as string;
  const userId = req.query.userId as string;

  // Check if the user IDs was provided
  if (!users || users.length === 0) {
    return res.status(400).send({ message: 'No user IDs provided!' });
  }

  // Check if the group ID was provided
  if (!groupId) {
    return res.status(400).send({ message: 'No group ID provided!' });
  }

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // check if group id is valid
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  // check if user id is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Check if user IDs are valid
  users.forEach((id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }
  });

  // Create an ObjectId from the user ID
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create an ObjectId from the group ID
  const groupObjectId = new mongoose.Types.ObjectId(groupId);

  // Create an ObjectId array from the user IDs
  const usersObjectId = users.map(id => new mongoose.Types.ObjectId(id));

  try {
    // get target user
    const targetUser = await User.findById(userObjectId);

    // add users to the group's invitedMembers array
    const targetGroup = await Group.findById(groupObjectId);

    // check if user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // check if group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    // Add invited users and remove repeated users from the invitedMembers array
    usersObjectId.forEach((id: mongoose.Types.ObjectId) => {
      if (!targetGroup.invitedMembers.includes(id)) {
        targetGroup.invitedMembers.push(id);
      }
    });

    // invite all users in the invitedMembers array to the group
    await User.updateMany(
      { _id: { $in: usersObjectId } },
      { $push: { receivedGroupInvites: groupObjectId } }
    );

    // save the user and group to the database
    await targetGroup.save();

    // send notifications to all invited users that they have been invited to the group
    sendNotifications(
      [...users],
      'New group invite! 🎉',
      targetUser.firstName +
        ' ' +
        targetUser.lastName +
        ' has invited you to join their group.',
      {
        notificationType: NotificationType.groupInvite,
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
      .send({ message: 'Successfully invited users to existing group!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Remove a member to an existing group by its ID, and sends a response.
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding a status and message.
 * @return {Promise} - A promise that resolves when the the members have been remove or failed to remove
 */
export const removeMemberInvitation = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const groupId = req.params.groupId as string;

  // Check if the user ID was provided
  if (!userId) {
    return res.status(400).send({ message: 'No user ID provided!' });
  }

  // Check if the group ID was provided
  if (!groupId) {
    return res.status(400).send({ message: 'No group ID provided!' });
  }

  // check if group id is valid
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  // check if user id is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  // Create an ObjectId from the user ID
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Create an ObjectId from the group ID
  const groupObjectId = new mongoose.Types.ObjectId(groupId);

  try {
    // remove user from the group's invitedMembers array
    const targetUser = await User.findById(userObjectId);

    // remove group from the user's receivedGroupInvites array
    const targetGroup = await Group.findById(groupObjectId);

    // check if user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // check if group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    // remove group from the user's receivedGroupInvites array
    targetUser.receivedGroupInvites = targetUser.receivedGroupInvites.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(groupObjectId)
    );

    // remove user from the group's invitedMembers array
    targetGroup.invitedMembers = targetGroup.invitedMembers.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
    );

    // save the user and group to the database
    await targetUser.save();
    await targetGroup.save();

    return res
      .status(200)
      .send({ message: 'Remove user invite to existing group' });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};
