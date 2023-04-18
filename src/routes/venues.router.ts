import express from 'express';
import {
  createVenue,
  getVenue,
  deleteVenue,
  updateVenue,
  getVenues,
  toggleReactionToVenue,
} from '../controllers/venue.controller';

const venuesRouter = express.Router();

/* Venue Controller */
venuesRouter.post('/', createVenue);
venuesRouter.get('/:venueId', getVenue);
venuesRouter.get('/', getVenues);
venuesRouter.delete('/:venueId', deleteVenue);
venuesRouter.patch('/:venueId', updateVenue);
venuesRouter.patch('/:venueId/react', toggleReactionToVenue);

export = venuesRouter;
