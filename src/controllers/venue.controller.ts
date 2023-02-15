/** source/controllers/posts.ts */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Venue as VenueInterface } from '../interfaces/Venue.interface';
import Venue from '../models/Venue.model';
import { mapEmoji } from '../utils/venue.utils';

export const createVenue = async (req: Request, res: Response) => {
  const newVenue = new Venue(req.body);

  try {
    await newVenue.save();
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  } finally {
    return res
      .status(201)
      .send({ message: 'Successfully created venue!', venue: newVenue });
  }
};

export const getVenue = async (req: Request, res: Response) => {
  let targetVenue: VenueInterface[] = [];

  try {
    const venueId = req.params?.venueId;
    const userId = req.query?.userId;
    targetVenue = await Venue.aggregate([
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
                input: ['🔥', '⚠️', '🛡', '💩', '🎉'],
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
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  } finally {
    return res
      .status(200)
      .send({ message: 'Successfully found venue!', venue: targetVenue[0] });
  }
};

export const addReactionToVenue = async (req: Request, res: Response) => {
  try {
    await Venue.findByIdAndUpdate(req.params?.venueId, {
      $push: { reactions: req.body },
    });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  } finally {
    return res
      .status(200)
      .send({ message: 'Successfully added reaction to Venue!' });
  }
};

export const deleteReactionFromVenue = async (req: Request, res: Response) => {
  try {
    const venueId = req.params?.venueId;
    const userId = req.query?.userId;
    const emoji = mapEmoji(req.query?.emoji as string);
    await Venue.updateOne(
      { _id: venueId },
      { $pull: { reactions: { userId: userId, emoji: emoji } } }
    );
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  } finally {
    return res
      .status(200)
      .send({ message: 'Successfully deleted reaction from Venue!' });
  }
};

export const deleteVenue = async (req: Request, res: Response) => {
  try {
    await Venue.deleteOne({ _id: req.params?.venueId });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  } finally {
    return res.status(200).send({ message: 'Successfully deleted venue!' });
  }
};
