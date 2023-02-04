/** source/controllers/posts.ts */
import { Request, Response } from 'express';
import User from '../models/User';

export const createUser = async (req: Request, res: Response) => {
  try {
    // Create a new example
    console.log('Creating a new example...');

    console.log('HERE: ' + req.body.body);

    const userInstance = new User(req.body.body);
    await userInstance.save();
  } catch (error: any) {
    // Error
    console.error(error.message);
    return res.status(500).send({ message: error.message });
  } finally {
    // Success
    const successMessage = 'Successfully created a new example!';
    console.log(successMessage);
    return res.status(201).send({ message: 'Congrats ass hole' });
  }
};
