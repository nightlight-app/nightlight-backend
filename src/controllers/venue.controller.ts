/** source/controllers/posts.ts */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Venue as VenueInterface } from '../interfaces/Venue.interface';
import Venue from '../models/Venue.model';
import { REACTION_EMOJIS, REACTION_EXPIRY_DURATION } from '../utils/constants';
import { Emoji } from '../utils/venue.utils';
import { addReactionExpireJob } from '../queue/jobs';
import { nightlightQueue } from '../queue/setup/queue.setup';
import { verifyKeys, KeyValidationType } from '../utils/validation.utils';

/**
 * Create a new venue
 * @param {Request} req - The request object containing the body with the venue data
 * @param {Response} res - The response object used to send the result of the action
 * @return {Promise} - A promise that resolves when the venue is successfully created or failed to create
 */
export const createVenue = async (req: Request, res: Response) => {
  const venue = req.body;

  const validationError = verifyKeys(venue, KeyValidationType.VENUES);
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  const newVenue = new Venue(venue);

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

    const userId = req.query.userId as string;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid venue ID!' });
    }

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

/**
 * Retrieves a venue with its ID and finds its associated reactions for the user,
 * given a userID query parameter. If an invalid venueID is provided or the venue
 * does not exist, an error message is sent instead.
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding the returned venue and messages.
 * @return {Promise} - A promise that resolves when the venue is successfully retrieve or failed to create
 * @return {Venue} - The venue with its associated reactions for the user.
 */
export const getVenues = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const count = Number(req.query?.count);

  // Check if the user ID is valid
  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    return res.status(400).send({ message: 'Invalid venue ID!' });
  }

  // Check if the count is valid
  if (Number(count) <= 0) {
    return res.status(400).send({ message: 'Invalid page count!' });
  }

  try {
    // Get the page number from the query parameters
    const page = Number(req.query?.page);

    // Get the number of venues to skip
    const skip = (page - 1) * count;

    // Find all venues with their associated reactions for the user
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

    // If no venues exist, send an error message
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

/**
 * Adds a reaction to a venue with specified ID
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding the returned venue and messages.
 * @return {Promise} - A promise that resolves when the reaction is successfully added or failed to add
 */
export const addReactionToVenue = async (req: Request, res: Response) => {
  try {
    const venueId = req.params?.venueId;
    const userId = req.query.userId as string;
    const emoji = req.query.emoji as Emoji;

    // Check if venue ID is valid
    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).send({ message: 'Invalid venue ID!' });
    }

    // Check if user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    // Add reaction to queue
    const job = await addReactionExpireJob(
      userId,
      venueId,
      emoji,
      REACTION_EXPIRY_DURATION
    );

    // Check if job was added to queue
    if (job === null || job?.id === undefined) {
      return res
        .status(400)
        .send({ message: 'Failed to react to venue, queue error!' });
    }

    // Add reaction to venue
    const result = await Venue.findByIdAndUpdate(
      venueId,
      {
        $push: {
          reactions: {
            userId: userId,
            emoji: emoji,
            queueId: job?.id,
          },
        },
      },
      { new: true }
    );

    // Check if venue exists
    if (result === null) {
      nightlightQueue.remove(job.id);
      return res.status(400).send({ message: 'Venue does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully added reaction to Venue!', body: result });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Remove a reaction to a venue with specified ID
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding the returned venue and messages.
 * @return {Promise} - A promise that resolves when the reaction is successfully removed or failed to remove
 */
export const deleteReactionFromVenue = async (req: Request, res: Response) => {
  try {
    const venueId = req.params.venueId;
    const userId = req.query.userId as string;
    const emoji = req.query.emoji as Emoji;

    // Check if venue ID is valid
    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).send({ message: 'Invalid venue ID!' });
    }

    // Check if user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    // Get venue
    const result = await Venue.findOne({ _id: venueId });

    // Check if venue exists
    if (result === null) {
      return res.status(400).send({ message: 'Venue does not exist!' });
    }

    // Find reaction index
    const reactionIndex = result.reactions.findIndex(
      r => r.userId === userId && r.emoji === emoji
    );

    // Remove reaction from venue
    const removedReaction = result.reactions.splice(reactionIndex, 1)[0];

    // Obtain queue ID
    const queueId = removedReaction.queueId;

    // Remove reaction from queue
    await result.updateOne({ $set: { reactions: result.reactions } });

    // Remove job from queue
    nightlightQueue.remove(queueId);

    return res.status(200).send({
      message: 'Successfully deleted reaction from venue: ' + venueId,
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Deletes a venue with specified ID
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding the returned venue and messages.
 * @return {Promise} - A promise that resolves when the venue is successfully deleted or failed to delete
 */
export const deleteVenue = async (req: Request, res: Response) => {
  const venueId = req.params?.venueId;

  // Check if venue ID is valid
  if (!mongoose.Types.ObjectId.isValid(venueId)) {
    return res.status(400).send({ message: 'Invalid venue ID!' });
  }

  try {
    // Delete venue
    const result = await Venue.deleteOne({ _id: venueId });

    // Check if venue was deleted
    if (result.deletedCount === 0) {
      return res.status(400).send({ message: 'Venue not found!' });
    }

    return res.status(200).send({ message: 'Successfully deleted venue!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Deletes a venue with specified ID
 * @param {Request} req - The request object containing the suggested request parameters.
 * @param {Response} res - The response object holding the returned venue and messages.
 * @return {Promise} - A promise that resolves when the venue is successfully deleted or failed to delete
 */
export const updateVenue = async (req: Request, res: Response) => {
  const venueId = req.params.venueId as string;

  // Check if venue ID is valid
  if (!mongoose.Types.ObjectId.isValid(venueId)) {
    return res.status(400).send({ message: 'Invalid venue ID!' });
  }

  try {
    // Update venue
    const result = await Venue.findByIdAndUpdate(venueId, req.body);

    // Check if venue was updated
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
