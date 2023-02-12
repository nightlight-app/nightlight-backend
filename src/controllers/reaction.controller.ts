import Reaction from '../models/Reaction';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const createReaction = async (req: Request, res: Response) => {
  const shapedReaction = {
    userId: new mongoose.Types.ObjectId(req.body?.userId),
    venueId: new mongoose.Types.ObjectId(req.body?.venueId),
    emoji: req.body?.emoji,
    expireAt: new Date(req.body?.expireAt),
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

export const deleteReaction = async (req: Request, res: Response) => {
  try {
    await Reaction.findByIdAndDelete(req.params.reactionId);
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  } finally {
    return res.status(204).send();
  }
};
