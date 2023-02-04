/** source/controllers/posts.ts */
import { Request, Response } from 'express';
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
    targetVenue = await Venue.findById(req.params.venueId);
  } catch (error: any) {
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
