import { Request, Response } from 'express';
import Group from '../models/Group';

export const createGroup = async (req: Request, res: Response) => {
  const newGroup = new Group(req.body);

  try {
    await newGroup.save();
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  } finally {
    return res
      .status(201)
      .send({ message: 'Successfully created group!', group: newGroup });
  }
};
