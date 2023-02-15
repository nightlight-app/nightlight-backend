/** source/controllers/posts.ts */
import { Request, Response } from 'express';
import User from '../models/User.model';

export const createUser = async (req: Request, res: Response) => {
  const newUser = new User(req.body);

  try {
    await newUser.save();
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ message: error?.message });
  } finally {
    return res
      .status(201)
      .send({ message: 'Successfully created user!', user: newUser });
  }
};

export const getUser = async (req: Request, res: Response) => {
  let targetUser;
  try {
    targetUser = await User.findById(req.params?.userId);
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ message: error?.message });
  } finally {
    return res
      .status(200)
      .send({ message: 'Successfully found user!', user: targetUser });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params?.userId);
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  } finally {
    return res.status(200).send({ message: 'Successfully deleted user!' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  let targetUser;

  try {
    targetUser = await User.findByIdAndUpdate(req.params?.userId, req.body);
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  } finally {
    return res
      .status(200)
      .send({ message: 'Successfully updated user!', user: targetUser });
  }
};
