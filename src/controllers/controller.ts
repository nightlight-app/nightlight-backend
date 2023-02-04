/** source/controllers/posts.ts */
import { Request, Response } from 'express';
import User from '../models/User';

export const createUser = async (req: Request, res: Response) => {
  const newUser = new User(req.body);

  try {
    await newUser.save();
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  } finally {
    return res
      .status(201)
      .send({ message: 'Successfully created user!', user: newUser });
  }
};

export const getUser = async (req: Request, res: Response) => {
  let targetUser;
  try {
    targetUser = await User.findById(req.params.userId);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  } finally {
    return res
      .status(200)
      .send({ message: 'Successfully found user!', user: targetUser });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  let targetUser;
  try {
    await User.deleteOne({ _id: req.params.userId });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  } finally {
    return res.status(200).send({ message: 'Successfully delete user!' });
  }
};
