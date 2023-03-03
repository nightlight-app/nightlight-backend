import { Request, Response } from 'express';
import User from '../models/User.model';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import Group from '../models/Group.model';

export const createUser = async (req: Request, res: Response) => {
  const newUser = new User(req.body);

  try {
    await newUser.save();
    return res
      .status(201)
      .send({ message: 'Successfully created user!', user: newUser });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const userId = req.query?.userId!.toString();
  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    const targetUser = await User.findById(userId);

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully found user!', user: targetUser });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params?.userId;

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }
    const result = await User.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(400).send({ message: 'User not found!' });
    }

    return res.status(200).send({ message: 'Successfully deleted user!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params?.userId;

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    const targetUser = await User.findByIdAndUpdate(userId, req.body);

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

export const saveGroup = async (req: Request, res: Response) => {
  const userId = req.params?.userId;

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    const targetUser = await User.findByIdAndUpdate(userId, {
      $push: {
        savedGroups: { ...req.body, _id: new mongoose.Types.ObjectId() },
      },
    });

    if (targetUser == undefined) {
      return res.status(400).send({ message: 'User does not exist!' });
    }
    return res
      .status(200)
      .send({ message: 'Successfully updated user!', user: targetUser });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const deleteSavedGroup = async (req: Request, res: Response) => {
  const userId = req.params?.userId;
  const savedGroupId = req.query?.savedGroupId!.toString();

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    if (!ObjectId.isValid(savedGroupId)) {
      return res.status(400).send({ message: 'Invalid saved group ID!' });
    }

    const targetUser = await User.findByIdAndUpdate(userId, {
      $pull: {
        savedGroups: { _id: savedGroupId },
      },
    });

    if (targetUser == undefined) {
      return res.status(400).send({ message: 'User does not exist!' });
    }
    return res
      .status(200)
      .send({ message: 'Successfully updated user!', user: targetUser });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const acceptGroupInvitation = async (req: Request, res: Response) => {
  const userId = req.params?.userId;
  const groupId = req.query?.groupId!.toString();

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    if (!ObjectId.isValid(groupId)) {
      return res.status(400).send({ message: 'Invalid group ID!' });
    }

    // Remove groupId from invited groups and add to currentGroup
    const targetUser = await User.findByIdAndUpdate(userId, {
      $pull: { invitedGroups: groupId },
      currentGroup: groupId,
    });

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Remove userId from invitedMembers in group and add to members in group
    const targetGroup = await Group.findByIdAndUpdate(groupId, {
      $pull: { invitedMembers: userId },
      $push: { members: userId },
    });

    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully accepted invitation to group!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  const userId = req.params?.userId!.toString();
  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    const targetUser = await User.findById(userId);

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    const targetFriends = await User.find({
      _id: { $in: targetUser?.friends },
    });

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
