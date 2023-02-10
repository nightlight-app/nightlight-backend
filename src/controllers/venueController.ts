/** source/controllers/posts.ts */
import { Request, Response } from 'express';
import Reaction from '../models/Reactions';
import User from '../models/User';
import Venue from '../models/Venue';

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
    let unfinishedVenue = await Venue.findById(req.params.venueId);
    let targetReactions = await Reaction.find({ venueId: req.params.venueId });
    // REFACTOR BELOW
    // this works but it needs to be more efficient

    const possibleEmojis = ['🔥', '⚠️', '🛡', '💩', '🎉'];
    const emojiCount = await Reaction.aggregate([
      {
        $match: {
          emoji: { $in: possibleEmojis },
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

    const emojiCountMap = new Map<string, number>();
    emojiCount.forEach(({ emoji, count }) => {
      emojiCountMap.set(emoji, count);
    });

    const result = [] as any;
    possibleEmojis.forEach(emoji => {
      result.push({
        emoji,
        count: emojiCountMap.has(emoji) ? emojiCountMap.get(emoji) : 0,
      });
    });

    targetVenue = {
      __v: unfinishedVenue?.__v,
      _id: unfinishedVenue?._id,
      name: unfinishedVenue?.name,
      address: unfinishedVenue?.address,
      reactions: result,
      location: {
        latitude: unfinishedVenue?.location?.latitude,
        longitude: unfinishedVenue?.location?.longitude,
      },
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
    await Venue.deleteOne({ _id: req.params.venueId });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  } finally {
    return res.status(200).send({ message: 'Successfully deleted venue!' });
  }
};
