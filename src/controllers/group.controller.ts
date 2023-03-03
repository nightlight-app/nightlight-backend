import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import Group from '../models/Group.model';
import User from '../models/User.model';
import { inviteUsersToGroup } from '../utils/group.utils';

export const createGroup = async (req: Request, res: Response) => {
  const userId = req.query?.userId!.toString();

  // create group
  const newGroup = new Group(req.body);

  try {
    // retrieve user creating the group
    const targetUser = await User.findById(userId);

    // null check
    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // if the user already has a currentGroup, throw error
    if (targetUser.currentGroup !== undefined) {
      return res.status(400).send({
        message:
          'Group cannot be created. User is already in an active group!',
      });
    }

    // save new group
    await newGroup.save();

    // add groupId to user
    targetUser.currentGroup = newGroup._id;

    // update user
    await targetUser.save();

    // invite the users in the group
    const result = inviteUsersToGroup(newGroup._id, newGroup.invitedMembers);

    // send appropriate response after members invited
    if (result.status !== 200) {
      return res.status(result.status).send({ message: result.message });
    } else {
      return res.status(result.status).send({
        message: result.message + ' to created group',
        group: newGroup,
      });
    }
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  try {
    if (!ObjectId.isValid(req.params?.groupId)) {
      return res.status(400).send({ message: 'Invalid group ID!' });
    }

    const targetGroup = await Group.findById(req.params?.groupId);

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

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    if (!ObjectId.isValid(req.params?.groupId)) {
      return res.status(400).send({ message: 'Invalid group ID!' });
    }

    const result = await Group.deleteOne({ _id: req.params?.groupId });

    if (result.deletedCount === 0) {
      return res.status(400).send({ message: 'Group not found!' });
    }

    return res.status(200).send({ message: 'Successfully deleted group!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const inviteMembersToExistingGroup = async (
  req: Request,
  res: Response
) => {
  const users = req.body;
  const groupId = req.params?.groupId;
  try {
    if (!ObjectId.isValid(groupId)) {
      return res.status(400).send({ message: 'Invalid group ID!' });
    }

    const targetGroup = await Group.findByIdAndUpdate(groupId, {
      $push: { invitedMembers: users },
    });

    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    const result = inviteUsersToGroup(groupId, users);

    return res
      .status(result.status)
      .send({ message: result.message + ' to existing group' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const removeMemberInvitation = async (req: Request, res: Response) => {
  const userId = req.query?.userId!.toString();
  const groupId = req.params?.groupId;
  try {
    if (!ObjectId.isValid(groupId)) {
      return res.status(400).send({ message: 'Invalid group ID!' });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    const targetUser = await User.findByIdAndUpdate(userId, {
      $pull: { invitedGroups: groupId },
    });

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    const targetGroup = await Group.findByIdAndUpdate(groupId, {
      $pull: { invitedMembers: userId },
    });

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
