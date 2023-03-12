/** source/controllers/posts.ts */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Venue as VenueInterface } from '../interfaces/Venue.interface';
import Venue from '../models/Venue.model';
import { REACTION_EMOJIS } from '../utils/constants';
import { encodeEmoji } from '../utils/venue.utils';
import { addReactionExpireJob } from '../queue/jobs';
import { Emoji } from '../utils/types';

export const createVenue = async (req: Request, res: Response) => {
  const newVenue = new Venue(req.body);

  try {
    await newVenue.save();

    return res
      .status(201)
      .send({ message: 'Successfully created venue!', venue: newVenue });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const getVenue = async (req: Request, res: Response) => {
  try {
    const venueId = req.params?.venueId;

    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).send({ message: 'Invalid venue ID!' });
    }

    const userId = req.query?.userId;
    const targetVenue: VenueInterface[] = await Venue.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(venueId),
        },
      },
      {
        $addFields: {
          reactions: {
            $arrayToObject: {
              $map: {
                input: REACTION_EMOJIS,
                as: 'emoji',
                in: {
                  k: '$$emoji',
                  v: {
                    count: {
                      $size: {
                        $filter: {
                          input: '$reactions',
                          cond: {
                            $eq: ['$$this.emoji', '$$emoji'],
                          },
                        },
                      },
                    },
                    didReact: {
                      $anyElementTrue: {
                        $map: {
                          input: {
                            $filter: {
                              input: '$reactions',
                              cond: {
                                $and: [
                                  { $eq: ['$$this.emoji', '$$emoji'] },
                                  { $eq: ['$$this.userId', userId] },
                                ],
                              },
                            },
                          },
                          as: 'reaction',
                          in: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    if (targetVenue.length == 0) {
      return res.status(400).send({ message: 'Venue does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully found venue!', venue: targetVenue[0] });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const getVenues = async (req: Request, res: Response) => {
  const userId = req.query?.userId;
  const count = Number(req.query?.count);

  try {
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res.status(400).send({ message: 'Invalid venue ID!' });
    }

    if (Number(count) <= 0) {
      return res.status(400).send({ message: 'Invalid page count!' });
    }

    const page = Number(req.query?.page);
    const skip = (page - 1) * count;

    const targetVenues: VenueInterface[] = await Venue.aggregate([
      {
        $addFields: {
          reactions: {
            $arrayToObject: {
              $map: {
                input: REACTION_EMOJIS,
                as: 'emoji',
                in: {
                  k: '$$emoji',
                  v: {
                    count: {
                      $size: {
                        $filter: {
                          input: '$reactions',
                          cond: {
                            $eq: ['$$this.emoji', '$$emoji'],
                          },
                        },
                      },
                    },
                    didReact: {
                      $anyElementTrue: {
                        $map: {
                          input: {
                            $filter: {
                              input: '$reactions',
                              cond: {
                                $and: [
                                  { $eq: ['$$this.emoji', '$$emoji'] },
                                  { $eq: ['$$this.userId', userId] },
                                ],
                              },
                            },
                          },
                          as: 'reaction',
                          in: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      { $skip: skip },
      { $limit: count },
    ]);

    if (targetVenues.length == 0) {
      return res.status(400).send({ message: 'Venues do not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully found venue!', venues: targetVenues });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const addReactionToVenue = async (req: Request, res: Response) => {
  try {
    const venueId = req.params?.venueId;
    const userId = req.query?.userId!.toString();
    const emoji = req.query?.emoji as Emoji;

    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).send({ message: 'Invalid venue ID!' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    const result = await Venue.findByIdAndUpdate(venueId, {
      $push: {
        reactions: {
          userId: userId,
          emoji: emoji,
        },
      },
    });

    addReactionExpireJob(userId, venueId, emoji, 5000);

    if (result === null) {
      return res.status(400).send({ message: 'Venue does not exist!' });
    }
    return res
      .status(200)
      .send({ message: 'Successfully added reaction to Venue!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const deleteReactionFromVenue = async (req: Request, res: Response) => {
  try {
    const venueId = req.params?.venueId;
    const userId = req.query?.userId;
    const emoji = req.query?.emoji as Emoji;

    if (!mongoose.Types.ObjectId.isValid(req.params?.venueId)) {
      return res.status(400).send({ message: 'Invalid venue ID!' });
    }

    const result = await Venue.updateOne(
      { _id: venueId },
      { $pull: { reactions: { userId: userId, emoji: emoji } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).send({ message: 'Reaction not found!' });
    }

    return res.status(200).send({
      message: 'Successfully deleted reaction from venue: ' + venueId,
    });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const deleteVenue = async (req: Request, res: Response) => {
  const venueId = req.params?.venueId;

  try {
    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).send({ message: 'Invalid venue ID!' });
    }
    const result = await Venue.deleteOne({ _id: venueId });

    if (result.deletedCount === 0) {
      return res.status(400).send({ message: 'Venue not found!' });
    }

    return res.status(200).send({ message: 'Successfully deleted venue!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const updateVenue = async (req: Request, res: Response) => {
  const venueId = req.params?.venueId;

  try {
    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).send({ message: 'Invalid venue ID!' });
    }

    const result = await Venue.findByIdAndUpdate(venueId, req.body);

    if (result === null) {
      return res.status(400).send({ message: 'Venue does not exist!' });
    }
    return res.status(200).send({
      message: 'Successfully added reaction to Venue!',
    });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};
