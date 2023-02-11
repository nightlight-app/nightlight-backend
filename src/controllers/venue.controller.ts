/** source/controllers/posts.ts */
import { Request, Response } from 'express';
import { EMOJIS } from '../utils/constants';
import Reaction from '../models/Reaction';
import User from '../models/User';
import Venue from '../models/Venue';
import { fillEmojiCount } from '../utils/venue.utils';

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
  let targetVenue;

  try {
    let partialVenue = await Venue.findById(req.params?.venueId);

    const emojiCount = await Reaction.aggregate([
      {
        $match: {
          emoji: { $in: EMOJIS },
        },
      },
      {
        $group: {
          _id: '$emoji',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          emoji: '$_id',
          count: 1,
        },
      },
      {
        $sort: {
          emoji: 1,
        },
      },
    ]);

    const completedEmojiCount = fillEmojiCount(emojiCount);

    targetVenue = {
      ...partialVenue?.toObject(),
      reactions: completedEmojiCount,
    };
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  } finally {
    return res
      .status(200)
      .send({ message: 'Successfully found venue!', venue: targetVenue });
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
