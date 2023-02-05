import Reaction from '../models/Reactions';
import { Request, Response } from 'express';
import { ObjectID } from 'bson';

export const createReaction = async (req: Request, res: Response) => {
  const shapedReaction = {
    userId: new ObjectID(req.body.userId),
    venueId: new ObjectID(req.body.venueId),
    emoji: req.body.emoji,
    expireAt: new Date(req.body.expireAt),
  };

  const newReaction = new Reaction(shapedReaction);

  try {
    await newReaction.save();
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  } finally {
    return res.status(201).send({
      message: 'Successfully created reaction!',
      reaction: newReaction,
    });
  }
};
