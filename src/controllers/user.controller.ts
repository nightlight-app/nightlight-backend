import { Request, Response } from 'express';
import User from '../models/User.model';
import { ObjectId } from 'mongodb';

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
  let targetUser;
  try {
    if (!ObjectId.isValid(req.params?.userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    targetUser = await User.findById(req.params?.userId);

    if (targetUser == undefined) {
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
  try {
    if (!ObjectId.isValid(req.params?.userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }
    const result = await User.deleteOne({ _id: req.params?.userId });

    if (result.deletedCount === 0) {
      return res.status(400).send({ message: 'User not found!' });
    }

    return res.status(200).send({ message: 'Successfully deleted user!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  let targetUser;

  try {
    if (!ObjectId.isValid(req.params?.userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    targetUser = await User.findByIdAndUpdate(req.params?.userId, req.body);

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
