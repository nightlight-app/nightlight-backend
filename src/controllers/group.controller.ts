import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Group from '../models/Group.model';
import User from '../models/User.model';
import { addGroupExpireJob } from '../queue/jobs';
import { NotificationType } from '../utils/constants';
import { inviteUsersToGroup } from '../utils/group.utils';
import { sendNotifications } from '../utils/notification.utils';

/**
 * Creates a new group and adds it to the database.
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding a status and message.
 * @return {Promise} - A promise that resolves when the group has been created or failed to create
 */
export const createGroup = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  // create a new group from the request body
  const newGroup = new Group(req.body);

  try {
    // check if user id is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    // retrieve user creating the group
    const targetUser = await User.findById(userId);

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

    // save the new group to the database
    await newGroup.save();

    // add the group id to the user's currentGroup field
    targetUser.currentGroup = newGroup._id;

    // save the user to the database with the new group id
    await targetUser.save();

    // invite all users in the invitedMembers array to the group
    const result = inviteUsersToGroup(newGroup._id, newGroup.invitedMembers);

    // add the group to the expire queue
    addGroupExpireJob(newGroup._id.toString(), 3000);

    // convert all user ids to strings for notification sending
    const stringIds = newGroup.invitedMembers.map(id => id.toString());

    // send notifications to all invited users that they have been invited to the group
    sendNotifications(
      [...stringIds],
      'New group invite! 🎉',
      targetUser.firstName +
        ' ' +
        targetUser.lastName +
        ' has invited you to join their group.',
      { notificationType: NotificationType.groupInvite },
      true
    );

    // TODO: refactor and remove group if failed to invite users
    if (result.status !== 200) {
      return res.status(result.status).send({ message: result.message });
    } else {
      return res.status(result.status).send({
        message: result.message + ' and created group',
        group: newGroup,
      });
    }
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

  try {
    // check if group id is valid
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).send({ message: 'Invalid group ID!' });
    }

    // retrieve group from database
    const targetGroup = await Group.findById(groupId);

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
  const groupId = req.params?.groupId;

  try {
    // check if group id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params?.groupId)) {
      return res.status(400).send({ message: 'Invalid group ID!' });
    }

    // delete group from database
    const result = await Group.deleteOne({ _id: groupId });

    // check if group was deleted
    if (result.deletedCount === 0) {
      return res.status(400).send({ message: 'Group not found!' });
    }

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
  const users = req.body;
  const groupId = req.params?.groupId;
  try {
    // check if group id is valid
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).send({ message: 'Invalid group ID!' });
    }

    // add users to the group's invitedMembers array
    const targetGroup = await Group.findByIdAndUpdate(groupId, {
      $push: { invitedMembers: users },
    });

    // check if group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    // invite all users in the invitedMembers array to the group
    const result = inviteUsersToGroup(groupId, users);

    return res
      .status(result.status)
      .send({ message: result.message + ' to existing group' });
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

  const groupId = req.params?.groupId;
  try {
    // check if group id is valid
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).send({ message: 'Invalid group ID!' });
    }

    // check if user id is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    // remove user from the group's invitedMembers array
    const targetUser = await User.findByIdAndUpdate(userId, {
      $pull: { invitedGroups: groupId },
    });

    // check if user exists
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // remove group from the user's invitedGroups array
    const targetGroup = await Group.findByIdAndUpdate(groupId, {
      $pull: { invitedMembers: userId },
    });

    // check if group exists
    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Remove user invite to existing group' });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};
