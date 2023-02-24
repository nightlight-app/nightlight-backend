import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import Group from '../models/Group.model';

export const createGroup = async (req: Request, res: Response) => {
  const newGroup = new Group(req.body);
  try {
    await newGroup.save();
    return res
      .status(201)
      .send({ message: 'Successfully created group!', group: newGroup });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  let targetGroup;
  try {
    if (!ObjectId.isValid(req.params?.groupId)) {
      return res.status(400).send({ message: 'Invalid group ID!' });
    }

    targetGroup = await Group.findById(req.params?.groupId);

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
